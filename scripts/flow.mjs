import {spawn} from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';

// The money path proof. Every number printed below is asserted here, against the app the customer
// uses — not against a fixture and not against a script's own POSTs.
const db = path.resolve('data/flow.db');
const log = path.resolve('data/events.log');
for (const f of [db, `${db}-wal`, `${db}-shm`, log, `${log}.1`]) if (fs.existsSync(f)) fs.rmSync(f);

const sid = '33333333-3333-4333-8333-333333333333';
const sid2 = '44444444-4444-4444-8444-444444444444';
const sid3 = '55555555-5555-4555-8555-555555555555';

// R-099: the port comes from the OS. A hardcoded port eventually collides with whatever else is
// running, and the failure reads as "server unavailable", which is how a gate starts lying.
const port = await new Promise((resolve, reject) => {
  const probe = net.createServer();
  probe.on('error', reject);
  probe.listen(0, '127.0.0.1', () => {
    const {port: free} = probe.address();
    probe.close(() => resolve(free));
  });
});

const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(port)], {
  env: {...process.env, DATABASE_PATH: db, EVENT_LOG_PATH: log},
  stdio: 'ignore',
});

const req = async (p, init) => {
  for (let i = 0; i < 60; i++) {
    try {
      return await fetch(`http://127.0.0.1:${port}${p}`, init);
    } catch {
      await new Promise(r => setTimeout(r, 250));
    }
  }
  throw Error('server unavailable');
};
const post = (p, body) => req(p, {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify(body)});
const json = async (p, body) => {
  const res = await post(p, body);
  return {status: res.status, body: await res.json()};
};
const assert = (condition, message) => {
  if (!condition) throw Error(message);
};
const countOrders = () => {
  const conn = new DatabaseSync(db);
  const row = conn.prepare('SELECT COUNT(*) AS n FROM orders').get();
  conn.close();
  return Number(row.n);
};
const expireHoldOf = orderRef => {
  const conn = new DatabaseSync(db);
  conn.prepare('UPDATE orders SET hold_expires_at=? WHERE order_ref=?').run(new Date(Date.now() - 60_000).toISOString(), orderRef);
  conn.close();
};
const statusOf = orderRef => {
  const conn = new DatabaseSync(db);
  const row = conn.prepare('SELECT status FROM orders WHERE order_ref=?').get(orderRef);
  conn.close();
  return row?.status;
};

try {
  assert((await req('/packs/bano')).ok, 'pack');

  // 1. m-1: two lines of the same pack are one line, one price, one section on the pass.
  const mergedCart = {lines: [{slug: 'completo', qty: 5}, {slug: 'completo', qty: 5}, {slug: 'completo', qty: 3}], name: 'Nadia B.', phone: '622222222', slotId: 'slot-1', session_id: sid3};
  let res = await json('/api/checkout', mergedCart);
  assert(res.status === 200, `merged lines checkout (${res.status} ${JSON.stringify(res.body)})`);
  const merged = res.body;
  const conn = new DatabaseSync(db);
  const snapshot = JSON.parse(conn.prepare('SELECT contents_snapshot FROM orders WHERE order_ref=?').get(merged.orderRef).contents_snapshot);
  conn.close();
  assert(snapshot.length === 1 && snapshot[0].slug === 'completo' && snapshot[0].qty === 13, `the order carries ${snapshot.length} line(s)`);
  const passHtml = await (await req(`/pedido/${merged.token}`)).text();
  assert(passHtml.includes('Pack completo'), 'the pass does not print the pack');

  // 2. B-3 / R-049: 234 of the 240 assembly minutes are held, so an 8-minute pack is refused.
  //    The lines are legal (5+5+3), so this is the product path and not a fixture (M-1).
  const bano = {lines: [{slug: 'bano', qty: 1}], name: 'Ana C.', phone: '633333333', slotId: 'slot-1', session_id: sid3};
  res = await json('/api/checkout', bano);
  assert(res.status === 400 && /capacidad/.test(res.body.error), `capacity refusal (${res.status} ${JSON.stringify(res.body)})`);

  // 3. R-049: the abandoned hold expires, releases its minutes, and cannot be paid afterwards.
  expireHoldOf(merged.orderRef);
  res = await json('/api/checkout', bano);
  assert(res.status === 200, `expired hold did not release the window (${res.status} ${JSON.stringify(res.body)})`);
  assert(statusOf(merged.orderRef) === 'expired', `the abandoned hold is still ${statusOf(merged.orderRef)}`);
  res = await json('/api/pay', {orderRef: merged.orderRef, token: merged.token, session_id: sid3});
  assert(res.status === 400 && /liberado/.test(res.body.error), 'an expired order accepted a payment');

  // 4. m-2: a counter refund takes paid or collected money only.
  res = await json('/api/mostrador', {action: 'refund', orderRef: merged.orderRef, session_id: sid3});
  assert(res.status === 400 && /no se ha pagado/.test(res.body.error), `refund of an unpaid order (${res.status})`);

  // 5. the ordinary purchase: order -> pay -> pass -> collect -> collect again -> refund twice
  const cart = {lines: [{slug: 'cocina', qty: 1}], name: 'Jorge H.', phone: '600000000', slotId: 'slot-1', session_id: sid};
  res = await json('/api/checkout', cart);
  assert(res.status === 200 && res.body.token, `checkout (${res.status})`);
  const order = res.body;
  res = await json('/api/pay', {orderRef: order.orderRef, token: order.token, session_id: sid});
  assert(res.body.status === 'paid', 'pay');
  const paid = res.body;
  assert((await req(`/pedido/${order.token}`)).ok, 'pass');

  // 6. B-2: the refresh that re-submits after payment must not mint a second order. Asserted here,
  //    while the order is still paid: a refunded order releases the key on purpose.
  const before = countOrders();
  res = await json('/api/checkout', cart);
  assert(res.body.existing === true && res.body.orderRef === order.orderRef, `paid dedupe (${JSON.stringify(res.body)})`);
  assert(countOrders() === before, 'paid dedupe wrote a row');

  res = await json('/api/mostrador', {pickup_code: paid.pickup_code, session_id: sid});
  assert(res.body.status === 'collected', 'collect');
  res = await json('/api/mostrador', {pickup_code: paid.pickup_code, session_id: sid});
  assert(res.body.status === 'already_collected', 'collect_twice');
  res = await json('/api/mostrador', {action: 'refund', orderRef: order.orderRef, session_id: sid});
  assert(res.body.status === 'refunded', 'refund');
  res = await json('/api/mostrador', {action: 'refund', orderRef: order.orderRef, session_id: sid});
  assert(res.status >= 400, 'refund_twice');

  // 7. B-7: the pass token is required. order_ref alone is not a bearer credential.
  res = await json('/api/pay', {orderRef: order.orderRef, session_id: sid});
  assert(res.status === 404, `pay without token (${res.status})`);

  // 8. B-1: the same session before payment gets a usable token back, not a tokenless dead end.
  const pendingCart = {lines: [{slug: 'habitacion', qty: 1}], name: 'Lucía P.', phone: '611111111', slotId: 'slot-1', session_id: sid2};
  const first = await json('/api/checkout', pendingCart);
  assert(first.status === 200 && first.body.token, 'pending checkout');
  const again = await json('/api/checkout', pendingCart);
  assert(again.body.existing === true && again.body.orderRef === first.body.orderRef, 'pending dedupe');
  assert(typeof again.body.token === 'string' && again.body.token.length > 20, 'refresh after step 1 got no token');
  assert(again.body.token !== first.body.token, 'the pass token was not rotated');
  assert((await req(`/pedido/${again.body.token}`)).ok, 'rotated token resolves the pass');
  assert((await req(`/pedido/${first.body.token}`)).status === 404, 'the old unpaid token still resolves');
  res = await json('/api/pay', {orderRef: again.body.orderRef, token: again.body.token, session_id: sid2});
  assert(res.body.status === 'paid', 'pay after refresh');

  console.log('flow: 8/8 steps · order=1 · collected=1 · collect_twice=refused · refund=1 · refund_twice=refused');
  console.log('flow+: token_required=404 · paid_dedupe=1 · refresh_token=rotated · merged_lines=1 · hold=released · expired=1 · refund_unpaid=refused');
} finally {
  child.kill();
}
