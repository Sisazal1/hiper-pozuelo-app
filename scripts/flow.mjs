import {spawn} from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';

// The money path proof. Every number printed below is asserted here, against the app the customer
// uses — not against a fixture and not against a script's own POSTs.
const db = path.resolve('data/flow.db');
const legacyDb = path.resolve('data/legacy.db');
const log = path.resolve('data/events.log');
for (const f of [db, `${db}-wal`, `${db}-shm`, legacyDb, `${legacyDb}-wal`, `${legacyDb}-shm`, log, `${log}.1`]) if (fs.existsSync(f)) fs.rmSync(f);

const sid = '33333333-3333-4333-8333-333333333333';
const sid2 = '44444444-4444-4444-8444-444444444444';
const sid3 = '55555555-5555-4555-8555-555555555555';
const sid4 = '66666666-6666-4666-8666-666666666666';

// R-099: the port comes from the OS. A hardcoded port eventually collides with whatever else is
// running, and the failure reads as "server unavailable", which is how a gate starts lying.
const freePort = () => new Promise((resolve, reject) => {
  const probe = net.createServer();
  probe.on('error', reject);
  probe.listen(0, '127.0.0.1', () => {
    const {port} = probe.address();
    probe.close(() => resolve(port));
  });
});
const sleep = ms => new Promise(r => setTimeout(r, ms));

function spawnServer(port, databasePath) {
  return spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(port)], {
    env: {...process.env, DATABASE_PATH: databasePath, EVENT_LOG_PATH: log},
    stdio: 'ignore',
  });
}

function client(port) {
  const req = async (p, init) => {
    for (let i = 0; i < 60; i++) {
      try {
        return await fetch(`http://127.0.0.1:${port}${p}`, init);
      } catch {
        await sleep(250);
      }
    }
    throw Error('server unavailable');
  };
  const post = (p, body) => req(p, {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify(body)});
  const json = async (p, body) => {
    const res = await post(p, body);
    return {status: res.status, body: await res.json()};
  };
  return {req, post, json};
}

const assert = (condition, message) => {
  if (!condition) throw Error(message);
};

// Every reader opens its own connection: the server holds the file, and a proof that reused the
// server's handle would be asserting the app against itself.
const countOrders = file => {
  const conn = new DatabaseSync(file);
  const row = conn.prepare('SELECT COUNT(*) AS n FROM orders').get();
  conn.close();
  return Number(row.n);
};
const snapshotOf = (file, orderRef) => {
  const conn = new DatabaseSync(file);
  const row = conn.prepare('SELECT contents_snapshot FROM orders WHERE order_ref=?').get(orderRef);
  conn.close();
  return JSON.parse(row.contents_snapshot);
};
const expireHoldOf = (file, orderRef) => {
  const conn = new DatabaseSync(file);
  conn.prepare('UPDATE orders SET hold_expires_at=? WHERE order_ref=?').run(new Date(Date.now() - 60_000).toISOString(), orderRef);
  conn.close();
};
const statusOf = (file, orderRef) => {
  const conn = new DatabaseSync(file);
  const row = conn.prepare('SELECT status FROM orders WHERE order_ref=?').get(orderRef);
  conn.close();
  return row?.status;
};
const capacityOf = file => {
  const conn = new DatabaseSync(file);
  const row = conn.prepare(`SELECT capacity_minutes FROM slots WHERE id='slot-1'`).get();
  conn.close();
  return row ? Number(row.capacity_minutes) : null;
};

// D-064 §4: the database Simon already has was written at 240 by an earlier commit. The seed has to
// reach it, or the same digest ships two windows and the gate cannot see the difference.
{
  const conn = new DatabaseSync(legacyDb);
  conn.exec('CREATE TABLE slots (id TEXT PRIMARY KEY, starts_at TEXT, ends_at TEXT, capacity_units INTEGER, capacity_minutes INTEGER)');
  conn.prepare('INSERT INTO slots (id,starts_at,ends_at,capacity_units,capacity_minutes) VALUES (?,?,?,?,?)')
    .run('slot-1', '2026-10-24T08:00:00.000Z', '2026-10-24T12:00:00.000Z', null, 240);
  conn.close();
}
assert(capacityOf(legacyDb) === 240, 'the legacy fixture has to start at 240');

const port = await freePort();
const server = spawnServer(port, db);
const app = client(port);

const legacyPort = await freePort();
const legacyServer = spawnServer(legacyPort, legacyDb);
const legacy = client(legacyPort);

try {
  assert((await app.req('/packs/bano')).ok, 'pack');

  // 1. m-1: two lines of the same pack are one line, one price, one section on the pass.
  const mergedCart = {lines: [{slug: 'completo', qty: 2}, {slug: 'completo', qty: 3}], name: 'Nadia B.', phone: '622222222', slotId: 'slot-1', session_id: sid3};
  let res = await app.json('/api/checkout', mergedCart);
  assert(res.status === 200, `merged lines checkout (${res.status} ${JSON.stringify(res.body)})`);
  const merged = res.body;
  const snapshot = snapshotOf(db, merged.orderRef);
  assert(snapshot.length === 1 && snapshot[0].slug === 'completo' && snapshot[0].qty === 5, `the order carries ${snapshot.length} line(s)`);
  const passHtml = await (await app.req(`/pedido/${merged.token}`)).text();
  assert(passHtml.includes('Pack completo'), 'the pass does not print the pack');

  // 2. R-041 (r11): the window is 190 assembly minutes and the cart that reaches it exactly is
  //    accepted. It is accepted only because the abandoned 90-minute hold above has expired — with
  //    that hold alive the same cart would answer 280 of 190 — so this acceptance is also the R-049
  //    proof that a lapsed hold hands its minutes back.
  expireHoldOf(db, merged.orderRef);
  const atTheCapCart = {lines: [{slug: 'completo', qty: 5}, {slug: 'habitacion', qty: 5}, {slug: 'cocina', qty: 5}], name: 'Ana C.', phone: '633333333', slotId: 'slot-1', session_id: sid3};
  res = await app.json('/api/checkout', atTheCapCart);
  assert(res.status === 200, `at-the-cap checkout (${res.status} ${JSON.stringify(res.body)})`);
  const full = res.body;
  assert(statusOf(db, merged.orderRef) === 'expired', `the abandoned hold is still ${statusOf(db, merged.orderRef)}`);

  // 3. the same window refuses one 8-minute pack on top — 198 of 190 — and a refusal writes no row.
  const before = countOrders(db);
  const overTheCap = {...atTheCapCart, lines: [...atTheCapCart.lines, {slug: 'bano', qty: 1}], session_id: sid4};
  res = await app.json('/api/checkout', overTheCap);
  assert(res.status === 400 && /capacidad/.test(res.body.error), `capacity refusal (${res.status} ${JSON.stringify(res.body)})`);
  assert(countOrders(db) === before, 'the refused order wrote a row');

  // 4. R-049: an expired hold cannot be paid, and no counter action releases it either.
  res = await app.json('/api/pay', {orderRef: merged.orderRef, token: merged.token, session_id: sid3});
  assert(res.status === 400 && /liberado/.test(res.body.error), 'an expired order accepted a payment');
  res = await app.json('/api/mostrador', {action: 'refund', orderRef: merged.orderRef, session_id: sid3});
  assert(res.status === 400 && /no se ha pagado/.test(res.body.error), `refund of an unpaid order (${res.status})`);

  // 5. the cap order is abandoned as well: its minutes return and the 8-minute pack enters where it
  //    was refused a moment ago.
  expireHoldOf(db, full.orderRef);
  const banoCart = {lines: [{slug: 'bano', qty: 1}], name: 'Ana C.', phone: '633333333', slotId: 'slot-1', session_id: sid3};
  res = await app.json('/api/checkout', banoCart);
  assert(res.status === 200, `the released window did not take the 8-minute pack (${res.status} ${JSON.stringify(res.body)})`);
  assert(statusOf(db, full.orderRef) === 'expired', `the cap order is still ${statusOf(db, full.orderRef)}`);

  // 6. the ordinary purchase: order -> pay -> pass -> collect -> collect again -> refund twice
  const cart = {lines: [{slug: 'cocina', qty: 1}], name: 'Jorge H.', phone: '600000000', slotId: 'slot-1', session_id: sid};
  res = await app.json('/api/checkout', cart);
  assert(res.status === 200 && res.body.token, `checkout (${res.status})`);
  const order = res.body;
  res = await app.json('/api/pay', {orderRef: order.orderRef, token: order.token, session_id: sid});
  assert(res.body.status === 'paid', 'pay');
  const paid = res.body;
  assert((await app.req(`/pedido/${order.token}`)).ok, 'pass');

  // 7. B-2: the refresh that re-submits after payment must not mint a second order. Asserted here,
  //    while the order is still paid: a refunded order releases the key on purpose.
  const paidCount = countOrders(db);
  res = await app.json('/api/checkout', cart);
  assert(res.body.existing === true && res.body.orderRef === order.orderRef, `paid dedupe (${JSON.stringify(res.body)})`);
  assert(countOrders(db) === paidCount, 'paid dedupe wrote a row');

  res = await app.json('/api/mostrador', {pickup_code: paid.pickup_code, session_id: sid});
  assert(res.body.status === 'collected', 'collect');
  res = await app.json('/api/mostrador', {pickup_code: paid.pickup_code, session_id: sid});
  assert(res.body.status === 'already_collected', 'collect_twice');
  res = await app.json('/api/mostrador', {action: 'refund', orderRef: order.orderRef, session_id: sid});
  assert(res.body.status === 'refunded', 'refund');
  res = await app.json('/api/mostrador', {action: 'refund', orderRef: order.orderRef, session_id: sid});
  assert(res.status >= 400, 'refund_twice');

  // 8. B-7: the pass token is required. order_ref alone is not a bearer credential.
  res = await app.json('/api/pay', {orderRef: order.orderRef, session_id: sid});
  assert(res.status === 404, `pay without token (${res.status})`);

  // 9. B-1: the same session before payment gets a usable token back, not a tokenless dead end.
  const pendingCart = {lines: [{slug: 'habitacion', qty: 1}], name: 'Lucía P.', phone: '611111111', slotId: 'slot-1', session_id: sid2};
  const first = await app.json('/api/checkout', pendingCart);
  assert(first.status === 200 && first.body.token, 'pending checkout');
  const again = await app.json('/api/checkout', pendingCart);
  assert(again.body.existing === true && again.body.orderRef === first.body.orderRef, 'pending dedupe');
  assert(typeof again.body.token === 'string' && again.body.token.length > 20, 'refresh after step 1 got no token');
  assert(again.body.token !== first.body.token, 'the pass token was not rotated');
  assert((await app.req(`/pedido/${again.body.token}`)).ok, 'rotated token resolves the pass');
  assert((await app.req(`/pedido/${first.body.token}`)).status === 404, 'the old unpaid token still resolves');
  res = await app.json('/api/pay', {orderRef: again.body.orderRef, token: again.body.token, session_id: sid2});
  assert(res.body.status === 'paid', 'pay after refresh');

  // 10. R-041 / R-042b, D-064 §4: the seed reaches a database that already exists, not only a fresh
  //     file, and the window it opens with is the one the requirement's fixture measures.
  assert(capacityOf(db) === 190, `a fresh database reads ${capacityOf(db)}`);
  res = await legacy.json('/api/checkout', {lines: [{slug: 'bano', qty: 1}], name: 'Segunda B.', phone: '644444444', slotId: 'slot-1', session_id: sid4});
  assert(res.status === 200, `the migrated database refused its first order (${res.status} ${JSON.stringify(res.body)})`);
  assert(capacityOf(legacyDb) === 190, `the migrated database reads ${capacityOf(legacyDb)}`);

  console.log('flow: 8/8 steps · order=1 · collected=1 · collect_twice=refused · refund=1 · refund_twice=refused');
  console.log('flow+: capacity_190=200 · capacity_198=400·no row · seed_fresh=190 · seed_migrated=190 · token_required=404 · paid_dedupe=1 · refresh_token=rotated · merged_lines=1 · hold=released · expired=1 · refund_unpaid=refused');
} finally {
  server.kill();
  legacyServer.kill();
}
