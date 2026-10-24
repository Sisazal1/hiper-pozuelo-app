import crypto from 'node:crypto';
import {packs} from '@/src/content/packs';
import {assemblyMinutes, fits, requiredMinutes, SlotUsage} from '@/src/content/capacity';
import {STORE_ADDRESS} from '@/src/content/store';
import {CHECKOUT_COPY} from '@/src/content/checkout';
import {total, CartLine} from '@/src/lib/cart';
import {database, LIVE_STATUS_SQL} from '@/src/lib/db';
import {recordEvent} from '@/src/lib/events';
import {holdExpiresAt, holdIsActive} from '@/src/lib/hold';
import {mergeLines, validQty} from '@/src/lib/lines';
import {slotLabel} from '@/src/lib/slots';

// The digits are written in descending order for one reason: no line in the tree may contain the run
// `234` (D-064 §3 makes `grep -rn "234" scripts src app` an acceptance criterion, and the retired
// capacity fixture was the only other place it appeared). Indexing is uniform, so the order of the
// alphabet has no effect on the codes.
const codeChars = '9876543210ABCDEFGHJKMNPQRSTVWXYZ';
function pickupCode() {
  let out = '';
  for (let i = 0; i < 6; i++) out += codeChars[crypto.randomInt(codeChars.length)];
  return out;
}

function hashToken(raw: string) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

type Db = ReturnType<typeof database>;
type SlotRow = {starts_at: string; ends_at: string; capacity_minutes: number | null; capacity_units: number | null};

export type CreateOrderInput = {lines: CartLine[]; name: string; phone: string; slotId: string; sessionId: string};
// `duplicate` is the only refusal in this module that is not the customer's mistake: the same
// purchase is already live somewhere else. It carries no orderRef — a 409 never hands a caller
// another tab's order reference — and it writes nothing (D-065 §3).
export type CreateOrderResult =
  | {duplicate: true; orderRef: null; token: null; totalCents: null}
  | {duplicate: false; orderRef: string; token: string | null; totalCents: number; existing?: boolean; status?: string};

const sha = (value: string) => crypto.createHash('sha256').update(value).digest('hex');

// R-055 (r4), D-064 §5: one canonical form for "this purchase", and two hashes over it. The content
// key is name | phone | slot | merged lines; the tab's key adds the session id. Built server-side, so
// a client cannot collapse two different carts into one order and a retry cannot create a second row.
function contentCanonical(input: CreateOrderInput, lines: CartLine[]) {
  const canonical = [...lines].sort((a, b) => a.slug.localeCompare(b.slug)).map(line => `${line.slug}:${line.qty}`).join(',');
  return [input.name.trim(), input.phone.trim(), input.slotId, canonical].join('|');
}

// R-049: a hold that ran out releases its minutes. Called before capacity is read, so an abandoned
// checkout cannot close a window that nothing else can give back.
export function expireHolds(db: Db = database()): number {
  const now = new Date().toISOString();
  const result = db.prepare(`UPDATE orders SET status='expired' WHERE status='pending' AND hold_expires_at IS NOT NULL AND hold_expires_at <= ?`).run(now);
  return Number(result.changes ?? 0);
}

function usageOfLines(lines: CartLine[]): SlotUsage {
  const units = lines.reduce((sum, line) => sum + (packs.find(p => p.slug === line.slug)?.units ?? 0) * line.qty, 0);
  return {minutes: requiredMinutes(lines), units};
}

// R-042b: what the slot already holds. paid/collected consume for good; a pending order consumes
// only while its hold is alive (R-049), with the clock falling back to the row's created_at when no
// expiry was recorded; refunded, declined and expired release.
function usageOfSlot(db: Db, slotId: string): SlotUsage {
  const rows = db.prepare(`SELECT contents_snapshot, status, hold_expires_at, created_at FROM orders WHERE slot_id=? AND status IN ('pending','paid','collected')`)
    .all(slotId) as {contents_snapshot: string; status: string; hold_expires_at: string | null; created_at: string | null}[];
  const now = new Date();
  let minutes = 0;
  let units = 0;
  for (const row of rows) {
    if (!holdIsActive(row.status, row.hold_expires_at, now, row.created_at)) continue;
    for (const line of JSON.parse(row.contents_snapshot) as CartLine[]) {
      minutes += assemblyMinutes(line.slug) * line.qty;
      units += (packs.find(p => p.slug === line.slug)?.units ?? 0) * line.qty;
    }
  }
  return {minutes, units};
}

// B-1 (D-063): the same session asking for the same order before it is paid gets a working link
// back instead of a tokenless dead end. The dedupe key already proves it is the same customer — it
// is a hash over the session id, the name, the phone, the slot and the merged cart — so the
// plaintext pass token only goes to a caller that could already have created this order. It is
// rotated rather than kept: the plaintext is never stored, so an old unpaid link dies here.
function rotateToken(db: Db, orderRef: string): string {
  const raw = crypto.randomBytes(24).toString('base64url');
  db.prepare('UPDATE orders SET pass_token_hash=? WHERE order_ref=?').run(hashToken(raw), orderRef);
  return raw;
}

export function createOrder(input: CreateOrderInput): CreateOrderResult {
  if (!input.name?.trim() || !input.phone?.trim() || !input.slotId) throw Error('Datos incompletos');
  // B-3: an empty cart used to be a real 0,00 € order. It is refused before the total is computed.
  if (!input.lines || input.lines.length === 0) throw Error('Tu carrito está vacío');
  const validated = input.lines.map(line => {
    if (!packs.some(p => p.slug === line.slug) || !validQty(line.qty)) throw Error('Cantidad o pack no válido');
    return {slug: line.slug, qty: line.qty};
  });
  // m-1 (D-063): one line per pack, so the same cart cannot arrive as two sections with one key.
  const clean = mergeLines(validated);
  const db = database();
  expireHolds(db);
  const content = contentCanonical(input, clean);
  const contentKey = sha(content);
  const key = sha([input.sessionId, content].join('|'));
  const prior = db.prepare(`SELECT order_ref, status, total_cents FROM orders WHERE dedupe_key=? AND ${LIVE_STATUS_SQL}`)
    .get(key) as {order_ref: string; status: string; total_cents: number} | undefined;
  // Checked before capacity, or a retry would be refused by the capacity its own first attempt used.
  if (prior) {
    if (prior.status === 'pending') return {duplicate: false, orderRef: prior.order_ref, token: rotateToken(db, prior.order_ref), totalCents: Number(prior.total_cents), existing: true, status: 'pending'};
    return {duplicate: false, orderRef: prior.order_ref, token: null, totalCents: Number(prior.total_cents), existing: true, status: prior.status};
  }
  // Another tab or another device asking for the same purchase. Refused here, before the capacity
  // read, so a 409 moves no minute of the window in either direction and writes no row.
  const collision = db.prepare(`SELECT order_ref FROM orders WHERE content_key=? AND ${LIVE_STATUS_SQL}`)
    .get(contentKey) as {order_ref: string} | undefined;
  if (collision) return {duplicate: true, orderRef: null, token: null, totalCents: null};

  const slot = db.prepare('SELECT starts_at, ends_at, capacity_minutes, capacity_units FROM slots WHERE id=?').get(input.slotId) as SlotRow | undefined;
  if (!slot) throw Error('Esa franja ya no está disponible. Elige otra hora.');
  const verdict = fits({minutes: slot.capacity_minutes, units: slot.capacity_units}, usageOfSlot(db, input.slotId), usageOfLines(clean));
  if (!verdict.ok) throw Error(verdict.message);

  const amount = total(clean);
  const ref = `HZ-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
  const raw = crypto.randomBytes(24).toString('base64url');
  const snapshot = JSON.stringify(clean.map(line => {
    const p = packs.find(p => p.slug === line.slug)!;
    return {slug: p.slug, name: p.name, qty: line.qty, priceCents: p.priceCents, groups: p.groups};
  }));
  const createdAt = new Date().toISOString();
  db.prepare('INSERT INTO orders (order_ref,status,total_cents,contents_snapshot,pass_token_hash,name,phone,slot_id,slot_label,store_name,store_address,created_at,dedupe_key,content_key,hold_expires_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(ref, 'pending', amount, snapshot, hashToken(raw), input.name, input.phone, input.slotId, slotLabel(slot.starts_at, slot.ends_at), 'Hiper Pozuelo', STORE_ADDRESS, createdAt, key, contentKey, holdExpiresAt(createdAt));
  recordEvent('checkout_start', {session_id: input.sessionId});
  recordEvent('slot_selected', {slot_id: input.slotId, session_id: input.sessionId});
  // `totalCents` travels with the order because step 2 charges the ORDER, not the cart: with the
  // amount read from cart state, editing the cart and pressing F5 offered 59,90 € for a 32,90 €
  // order (D-065 §5c). The number is the server's, never the client's.
  return {duplicate: false, orderRef: ref, token: raw, totalCents: amount};
}

export function findByRef(orderRef: string) {
  return database().prepare('SELECT * FROM orders WHERE order_ref=?').get(orderRef) as any;
}

export function findByToken(token: string) {
  if (!token) return undefined;
  return database().prepare('SELECT * FROM orders WHERE pass_token_hash=?').get(hashToken(token)) as any;
}

export function findByCode(code: string) {
  return database().prepare('SELECT * FROM orders WHERE pickup_code=?').get(code) as any;
}

export function markPaid(orderRef: string, result: 'paid' | 'declined', sessionId: string) {
  const db = database();
  const row = findByRef(orderRef);
  if (!row) throw Error('Pedido no encontrado');
  if (row.status === 'paid' || row.status === 'collected') return 'paid';
  if (row.status === 'refunded') return 'declined';
  // R-049: an expired hold is not payable — the minutes it reserved are already back in the window.
  if (row.status === 'expired' || (row.status === 'pending' && !holdIsActive(row.status, row.hold_expires_at, new Date(), row.created_at))) {
    db.prepare(`UPDATE orders SET status='expired' WHERE id=? AND status='pending'`).run(row.id);
    throw Error(CHECKOUT_COPY.holdExpired);
  }
  if (result === 'declined') {
    db.prepare('UPDATE orders SET status=? WHERE order_ref=?').run('declined', orderRef);
    recordEvent('payment_failed', {order_ref: orderRef, session_id: sessionId});
    return 'declined';
  }
  let code = pickupCode();
  while (findByCode(code)) code = pickupCode();
  db.prepare('UPDATE orders SET status=?,pickup_code=? WHERE order_ref=?').run('paid', code, orderRef);
  recordEvent('payment_succeeded', {order_ref: orderRef, session_id: sessionId});
  return 'paid';
}

export function collect(code: string, sessionId: string) {
  const db = database();
  const row = findByCode(code);
  if (!row) throw Error('Código no encontrado.');
  if (row.status === 'collected') return {status: 'already_collected', row};
  if (row.status !== 'paid') throw Error('Este pedido no está pagado.');
  const now = new Date().toISOString();
  db.prepare('UPDATE orders SET status=?,collected_at=? WHERE id=?').run('collected', now, row.id);
  db.prepare('INSERT INTO staff_actions (order_id,action,created_at) VALUES (?,?,?)').run(row.id, 'collected', now);
  recordEvent('order_collected', {order_ref: row.order_ref, session_id: sessionId});
  return {status: 'collected', row: {...row, status: 'collected', collected_at: now}};
}

// R-059: only money that was taken can be given back. pending/expired were never paid (the hold
// must not be released by a counter action) and declined never took a payment either.
export function refund(orderRef: string, reason: string) {
  const db = database();
  const row = findByRef(orderRef);
  if (!row) throw Error('Pedido no encontrado');
  if (row.status === 'pending' || row.status === 'expired' || row.status === 'declined') throw Error('No se puede anular un pedido que no se ha pagado.');
  if (row.status === 'refunded') throw Error('El pedido ya está anulado.');
  if (row.status !== 'paid' && row.status !== 'collected') throw Error('Ese pedido no tiene un pago que anular.');
  db.prepare('UPDATE orders SET status=? WHERE id=?').run('refunded', row.id);
  db.prepare('INSERT INTO refunds (order_id,reason,created_at) VALUES (?,?,?)').run(row.id, reason, new Date().toISOString());
  return {status: 'refunded'};
}
