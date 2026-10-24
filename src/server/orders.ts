import crypto from 'node:crypto';
import {packs} from '@/src/content/packs';
import {assemblyMinutes, fits, requiredMinutes, SlotUsage} from '@/src/content/capacity';
import {STORE_ADDRESS} from '@/src/content/store';
import {total, validQty, CartLine} from '@/src/lib/cart';
import {database} from '@/src/lib/db';
import {recordEvent} from '@/src/lib/events';
import {slotLabel} from '@/src/lib/slots';

const codeChars = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
function pickupCode() {
  let out = '';
  for (let i = 0; i < 6; i++) out += codeChars[crypto.randomInt(codeChars.length)];
  return out;
}

type Db = ReturnType<typeof database>;
type SlotRow = {starts_at: string; ends_at: string; capacity_minutes: number | null; capacity_units: number | null};

export type CreateOrderInput = {lines: CartLine[]; name: string; phone: string; slotId: string; sessionId: string};
export type CreateOrderResult = {orderRef: string; token: string | null; existing?: boolean};

// B-4 (R-055): the key is built server-side from the request, so a client cannot collapse two
// different carts into one order and a retry of the same request cannot create a second row.
function dedupeKey(input: CreateOrderInput, lines: CartLine[]) {
  const canonical = [...lines].sort((a, b) => a.slug.localeCompare(b.slug)).map(line => `${line.slug}:${line.qty}`).join(',');
  return crypto.createHash('sha256').update([input.sessionId, input.name.trim(), input.phone.trim(), input.slotId, canonical].join('|')).digest('hex');
}

function usageOfLines(lines: CartLine[]): SlotUsage {
  const units = lines.reduce((sum, line) => sum + (packs.find(p => p.slug === line.slug)?.units ?? 0) * line.qty, 0);
  return {minutes: requiredMinutes(lines), units};
}

// R-042b: what the slot already holds. pending and paid consume; refunded and declined release.
function usageOfSlot(db: Db, slotId: string): SlotUsage {
  const rows = db.prepare(`SELECT contents_snapshot FROM orders WHERE slot_id=? AND status IN ('pending','paid')`).all(slotId) as {contents_snapshot: string}[];
  let minutes = 0;
  let units = 0;
  for (const row of rows) {
    for (const line of JSON.parse(row.contents_snapshot) as CartLine[]) {
      minutes += assemblyMinutes(line.slug) * line.qty;
      units += (packs.find(p => p.slug === line.slug)?.units ?? 0) * line.qty;
    }
  }
  return {minutes, units};
}

export function createOrder(input: CreateOrderInput): CreateOrderResult {
  if (!input.name || !input.phone || !input.slotId) throw Error('Datos incompletos');
  // B-3: an empty cart used to be a real 0,00 € order. It is refused before the total is computed.
  if (!input.lines || input.lines.length === 0) throw Error('Tu carrito está vacío');
  const clean = input.lines.map(line => {
    if (!packs.some(p => p.slug === line.slug) || !validQty(line.qty)) throw Error('Cantidad o pack no válido');
    return {slug: line.slug, qty: line.qty};
  });
  const db = database();
  const key = dedupeKey(input, clean);
  const prior = db.prepare(`SELECT order_ref FROM orders WHERE dedupe_key=? AND status='pending'`).get(key) as {order_ref: string} | undefined;
  // The pass is not re-issued: the plaintext token exists only in the response that created it.
  // Checked before capacity, or a retry would be refused by the capacity its own first attempt used.
  if (prior) return {orderRef: prior.order_ref, token: null, existing: true};

  const slot = db.prepare('SELECT starts_at, ends_at, capacity_minutes, capacity_units FROM slots WHERE id=?').get(input.slotId) as SlotRow | undefined;
  if (!slot) throw Error('Esa franja ya no está disponible. Elige otra hora.');
  const verdict = fits({minutes: slot.capacity_minutes, units: slot.capacity_units}, usageOfSlot(db, input.slotId), usageOfLines(clean));
  if (!verdict.ok) throw Error(verdict.message);

  const amount = total(clean);
  const ref = `HZ-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
  const raw = crypto.randomBytes(24).toString('base64url');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  const snapshot = JSON.stringify(clean.map(line => {
    const p = packs.find(p => p.slug === line.slug)!;
    return {slug: p.slug, name: p.name, qty: line.qty, priceCents: p.priceCents, groups: p.groups};
  }));
  db.prepare('INSERT INTO orders (order_ref,status,total_cents,contents_snapshot,pass_token_hash,name,phone,slot_id,slot_label,store_name,store_address,created_at,dedupe_key) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(ref, 'pending', amount, snapshot, hash, input.name, input.phone, input.slotId, slotLabel(slot.starts_at, slot.ends_at), 'Hiper Pozuelo', STORE_ADDRESS, new Date().toISOString(), key);
  recordEvent('checkout_start', {session_id: input.sessionId});
  recordEvent('slot_selected', {slot_id: input.slotId, session_id: input.sessionId});
  return {orderRef: ref, token: raw};
}

export function findByRef(orderRef: string) {
  return database().prepare('SELECT * FROM orders WHERE order_ref=?').get(orderRef) as any;
}

export function findByToken(token: string) {
  return database().prepare('SELECT * FROM orders WHERE pass_token_hash=?').get(crypto.createHash('sha256').update(token).digest('hex')) as any;
}

export function findByCode(code: string) {
  return database().prepare('SELECT * FROM orders WHERE pickup_code=?').get(code) as any;
}

export function markPaid(orderRef: string, result: 'paid' | 'declined', sessionId: string) {
  const db = database();
  const row = findByRef(orderRef);
  if (!row) throw Error('Pedido no encontrado');
  if (row.status === 'paid' || row.status === 'collected' || row.status === 'refunded') return row.status === 'refunded' ? 'declined' : 'paid';
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

export function refund(orderRef: string, reason: string) {
  const db = database();
  const row = findByRef(orderRef);
  if (!row) throw Error('Pedido no encontrado');
  if (row.status === 'pending') throw Error('No se puede anular un pedido pendiente.');
  if (row.status === 'refunded') throw Error('El pedido ya está anulado.');
  db.prepare('UPDATE orders SET status=? WHERE id=?').run('refunded', row.id);
  db.prepare('INSERT INTO refunds (order_id,reason,created_at) VALUES (?,?,?)').run(row.id, reason, new Date().toISOString());
  return {status: 'refunded'};
}
