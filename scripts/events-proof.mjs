// R-080 / R-081b / R-099b - event proof driven through the real app over CDP.
// One browser per profile, each profile on its own free CDP port (never the app port),
// and assertions on the exact ten-name set as emitted by the app, not written by this script.
import {spawn} from 'node:child_process';
import net from 'node:net';
import fs from 'node:fs';
import path from 'node:path';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const DB = path.resolve('data/proof.db');
const LOG = path.resolve('data/events.log');
const SCRATCH = path.resolve('data/edge-proof');
const TEN = ['pack_view','add_to_cart','cart_removed','checkout_start','checkout_step_viewed','slot_selected','payment_succeeded','payment_failed','order_collected','session_source'];

const wait = ms => new Promise(r => setTimeout(r, ms));

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const {port} = server.address();
      server.close(() => resolve(port));
    });
  });
}

function kill(proc) {
  if (!proc || proc.exitCode !== null) return;
  try { spawn('taskkill', ['/PID', String(proc.pid), '/T', '/F'], {stdio: 'ignore'}); } catch {}
}

async function waitForTarget(port) {
  let last = 'no response';
  for (let i = 0; i < 80; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const text = await res.text();
      try {
        const page = JSON.parse(text).find(t => t.type === 'page');
        if (page?.webSocketDebuggerUrl) return page;
        last = 'no page target';
      } catch { last = `non-JSON (HTTP ${res.status})`; }
    } catch (error) { last = error.message; }
    await wait(250);
  }
  throw Error(`CDP target unavailable on ${port}: ${last}`);
}

async function session(label, cdpPort) {
  const userDir = path.join(SCRATCH, label);
  fs.rmSync(userDir, {recursive: true, force: true});
  fs.mkdirSync(userDir, {recursive: true});
  const proc = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${cdpPort}`, `--user-data-dir=${userDir}`, '--no-first-run', '--no-default-browser-check', '--disable-gpu', 'about:blank'], {stdio: 'ignore'});
  const target = await waitForTarget(cdpPort);
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, {once: true});
    ws.addEventListener('error', () => reject(Error(`websocket refused on ${cdpPort}`)), {once: true});
  });
  let seq = 0;
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++seq;
    const onMessage = e => {
      const m = JSON.parse(e.data);
      if (m.id !== id) return;
      ws.removeEventListener('message', onMessage);
      m.error ? reject(Error(`${method}: ${m.error.message}`)) : resolve(m.result);
    };
    ws.addEventListener('message', onMessage);
    ws.send(JSON.stringify({id, method, params}));
  });
  const evaluate = async expression => {
    const r = await call('Runtime.evaluate', {expression, awaitPromise: true, returnByValue: true});
    if (r.exceptionDetails) throw Error(`page error: ${r.exceptionDetails.exception?.description ?? r.exceptionDetails.text}`);
    return r.result?.value;
  };
  const poll = async (expression, timeout = 10000) => {
    const end = Date.now() + timeout;
    while (Date.now() < end) {
      try { const v = await evaluate(expression); if (v) return v; } catch {}
      await wait(120);
    }
    throw Error(`${label}: timeout waiting for ${expression}`);
  };
  const go = async (appPort, url, readySelector) => {
    await call('Page.navigate', {url: `http://127.0.0.1:${appPort}${url}`});
    await poll('document.readyState==="complete"');
    await poll(`!!document.querySelector(${JSON.stringify(readySelector)})`);
    await wait(400); // hydration + mount beacons
  };
  // A click before hydration is a silent no-op: click, then require the effect, retrying.
  const retry = async (action, effect, timeout = 15000) => {
    const end = Date.now() + timeout;
    while (Date.now() < end) {
      try { await evaluate(action); } catch {}
      const slice = Date.now() + 2500;
      while (Date.now() < slice) {
        try { if (await evaluate(effect)) return; } catch {}
        await wait(120);
      }
    }
    throw Error(`${label}: ${action} never produced ${effect}`);
  };
  const clickWhen = (selector, effect, timeout) => retry(`document.querySelector(${JSON.stringify(selector)}).click(),true`, effect, timeout);
  const typeWhen = async (index, value) => {
    const expression = `(()=>{const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;const i=document.querySelectorAll('.cardbody input')[${index}];if(!i)return null;set.call(i,${JSON.stringify(value)});i.dispatchEvent(new Event('input',{bubbles:true}));return i.value})()`;
    for (let i = 0; i < 8; i++) {
      if (await evaluate(expression) === value) { await wait(120); return; }
      await wait(300);
    }
    throw Error(`${label}: could not type into checkout input ${index}`);
  };
  const click = async selector => {
    await poll(`!!document.querySelector(${JSON.stringify(selector)})`);
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).click(),true`);
  };
  return {proc, ws, call, evaluate, poll, go, click, clickWhen, retry, typeWhen, close: () => { try { ws.close(); } catch {} kill(proc); }};
}

const failures = [];
const check = (ok, message) => { if (!ok) failures.push(message); };
const eq = (actual, expected, message) => check(JSON.stringify(actual) === JSON.stringify(expected), `${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
const once = (rows, name, message) => eq(rows.filter(r => r.name === name).length, 1, message);

let server;
let first;
let second;
try {
  const appPort = await freePort();
  const cdpOne = await freePort();
  const cdpTwo = await freePort();
  if (new Set([appPort, cdpOne, cdpTwo]).size !== 3) throw Error('port allocation collided');

  for (const f of [DB, `${DB}-wal`, `${DB}-shm`, LOG]) if (fs.existsSync(f)) fs.rmSync(f);

  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(appPort)], {env: {...process.env, DATABASE_PATH: DB, EVENT_LOG_PATH: LOG}, stdio: 'ignore'});
  for (let i = 0; ; i++) {
    try { if ((await fetch(`http://127.0.0.1:${appPort}/packs/bano`)).ok) break; } catch {}
    if (i > 60) throw Error('app server did not start');
    await wait(250);
  }

  // ---- session A: the whole money path, driven by clicking real UI ----
  first = await session('profile-a', cdpOne);

  await first.go(appPort, '/packs/bano', '.detail .btn');
  await first.clickWhen('.detail .btn', 'location.pathname==="/carrito"');   // add_to_cart bano

  await first.go(appPort, '/packs/cocina', '.detail .btn');
  await first.clickWhen('.detail .btn', 'location.pathname==="/carrito"');   // add_to_cart cocina

  await first.go(appPort, '/packs/habitacion', '.detail .btn');              // pack_view habitacion

  await first.go(appPort, '/packs/bano', '.detail .btn');
  await first.clickWhen('.detail .btn', 'location.pathname==="/carrito"');   // add_to_cart bano again (qty 2)

  await first.go(appPort, '/carrito', '.row button');
  eq(await first.evaluate(`document.querySelectorAll('.row button').length`), 6, 'cart rows before removal');
  await first.retry(`[...document.querySelectorAll('.row button')].find(b=>/^Quitar /.test(b.getAttribute('aria-label')||'')).click(),true`, `document.querySelectorAll('.row button').length===3`); // cart_removed
  await wait(300);
  const cartTotal = await first.evaluate(`document.querySelector('.price')?.textContent?.trim() ?? ''`);
  check(/\d/.test(cartTotal), `cart total readable after removal (got ${JSON.stringify(cartTotal)})`);

  await first.go(appPort, '/checkout', '.cardbody input');
  const sidA = await first.evaluate(`sessionStorage.getItem('hiper-session-id')`);
  check(typeof sidA === 'string' && /^[0-9a-f-]{36}$/.test(sidA), `session A id is a UUID (got ${sidA})`);

  await first.typeWhen(0, 'Jorge H.');
  await first.typeWhen(1, '600000000');
  await first.clickWhen('.cardbody .btn', `document.querySelector('.cardbody')?.textContent.includes('Pago simulado')`); // checkout_start + slot_selected + step 2

  await first.click('.cardbody .btn.secondary');                             // payment_failed (client)
  await wait(500);
  await first.clickWhen('.cardbody .btn:not(.secondary)', `document.querySelector('.cardbody')?.textContent.includes('Revisión')`); // payment_succeeded + step 3

  await first.clickWhen('.cardbody .btn', `document.querySelector('a.btn')?.getAttribute('href')?.startsWith('/pedido/')`); // step 4

  const token = await first.evaluate(`document.querySelector('a.btn').getAttribute('href').split('/').pop()`);
  await first.clickWhen('a.btn', 'location.pathname.startsWith("/pedido/")');
  const pickup = await first.poll(`document.querySelector('.pickup-code')?.textContent?.trim() || null`);
  check(/^[0-9A-HJKMNP-TV-Z]{6}$/.test(pickup), `pickup code on printed pass (got ${pickup})`);

  // B14: an unknown token must 404 without an order row.
  const miss = await first.evaluate(`fetch('/pedido/lo-que-sea').then(r=>r.status)`);
  eq(miss, 404, 'GET /pedido/lo-que-sea');

  // collect over the counter, then refuse the second collection
  const collect1 = await first.evaluate(`fetch('/api/mostrador',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pickup_code:${JSON.stringify(pickup)},session_id:sessionStorage.getItem('hiper-session-id')})}).then(r=>r.json())`);
  eq(collect1.status, 'collected', 'first collection');
  const collect2 = await first.evaluate(`fetch('/api/mostrador',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pickup_code:${JSON.stringify(pickup)},session_id:sessionStorage.getItem('hiper-session-id')})}).then(r=>r.json())`);
  eq(collect2.status, 'already_collected', 'second collection refused');

  // session_source is once per session: the second post must be refused by the server
  const dedupe = await first.evaluate(`fetch('/api/events',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'session_source',payload:{source:'direct',session_id:sessionStorage.getItem('hiper-session-id')}})}).then(r=>r.status)`);
  eq(dedupe, 409, 'duplicate session_source');

  // the pass must still resolve with the same token (no restart needed)
  const passStatus = await first.evaluate(`fetch('/pedido/${token}').then(r=>r.status)`);
  eq(passStatus, 200, 'pass resolves by token');

  // ---- session B: a fresh profile must produce a different id and its own source ----
  second = await session('profile-b', cdpTwo);
  await second.go(appPort, '/packs/bano?utm_source=instagram', '.detail .btn');
  const sidB = await second.evaluate(`sessionStorage.getItem('hiper-session-id')`);
  check(typeof sidB === 'string' && sidB.length > 0, 'session B id present');
  await wait(400);
} finally {
  first?.close();
  second?.close();
  kill(server);
}

const rows = fs.readFileSync(LOG, 'utf8').split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
const sidOf = rows.map(r => r.payload?.session_id);
const sessions = [...new Set(sidOf)];
const a = sessions[0] ?? null;
const rowsA = rows.filter(r => r.payload?.session_id === a);
const rowsB = rows.filter(r => r.payload?.session_id !== a);
const namesAll = [...new Set(rows.map(r => r.name))].sort();
const namesA = [...new Set(rowsA.map(r => r.name))].sort();

eq(namesAll, [...TEN].sort(), 'event name set');
eq(namesA, [...TEN].sort(), 'session A covers all ten names');
eq(sessions.length, 2, 'distinct sessions');
check(sidOf.every(s => typeof s === 'string' && s.trim() !== ''), 'no null session_id');
check(sessions.length === 2 && sessions[0] !== sessions[1], 'second profile reused the first session id');

const A = name => rowsA.filter(r => r.name === name);
eq([...new Set(A('pack_view').map(r => r.payload.slug))].sort(), ['bano','cocina','habitacion'], 'pack_view slugs');
eq(A('pack_view').map(r => r.payload.slug), ['bano','cocina','habitacion','bano'], 'pack_view order');
eq(A('add_to_cart').map(r => r.payload.slug), ['bano','cocina','bano'], 'add_to_cart slugs');
check(A('add_to_cart').every(r => r.payload.source === 'pack_page'), 'add_to_cart source');
eq(A('add_to_cart').map(r => r.payload.qty), [1,1,1], 'add_to_cart qty');
eq(A('cart_removed').map(r => r.payload.slug), ['bano'], 'cart_removed slug');
once(rowsA, 'checkout_start', 'checkout_start');
once(rowsA, 'slot_selected', 'slot_selected');
once(rowsA, 'payment_succeeded', 'payment_succeeded');
once(rowsA, 'payment_failed', 'payment_failed');
once(rowsA, 'order_collected', 'order_collected');
once(rowsA, 'session_source', 'session_source once per session');
eq(A('checkout_step_viewed').map(r => r.payload.step).sort(), [1,2,3,4], 'checkout steps');
check(A('payment_failed').every(r => typeof r.payload.order_ref === 'string'), 'payment_failed order_ref');
check(A('slot_selected').every(r => typeof r.payload.slot_id === 'string'), 'slot_selected slot_id');
eq(rowsB.map(r => r.name).sort(), ['pack_view','session_source'], 'session B names');
eq(rowsB.filter(r => r.name === 'pack_view').map(r => r.payload.slug), ['bano'], 'session B pack_view');
eq(rowsB.find(r => r.name === 'session_source')?.payload.source, 'instagram', 'session B source from utm_source');

const logText = fs.readFileSync(LOG, 'utf8');
check(!logText.includes('Jorge'), 'customer name absent from events');
check(!logText.includes('600000000'), 'customer phone absent from events');
check(rows.every(r => !Object.keys(r.payload ?? {}).some(k => /email|phone|user_agent|(^|_)ip$|card|address/i.test(k))), 'no PII keys');
check(logText.trim().split(/\r?\n/).length === rows.length, 'log is one JSON object per line');

if (failures.length) throw Error(`event assertions failed (${failures.length}):\n- ${failures.join('\n- ')}`);

const count = name => rowsA.filter(r => r.name === name).length;
console.log(`events: ${namesA.length}/10 names · pack_view=${count('pack_view')} (3 slugs, bano twice) · add_to_cart=3 (source=pack_page) · cart_removed=${count('cart_removed')} · checkout_start=${count('checkout_start')} · steps=1,2,3,4 · slot_selected=${count('slot_selected')} · payment_failed=${count('payment_failed')} · payment_succeeded=${count('payment_succeeded')} · order_collected=${count('order_collected')} · session_source=1 · session_id null=0 · stable-across-${rowsA.length} · new-session-differs · source=instagram · dedupe=409 · 404=ok · pii=0`);
