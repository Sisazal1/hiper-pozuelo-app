import {spawn} from 'node:child_process';
import fs from 'node:fs';

const root = process.cwd();
const node = process.execPath;
const port = 3100;
const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const profile = `${root}/data/perf-profile`;
const server = spawn(node, ['node_modules/next/dist/bin/next', 'start', '-p', String(port)], {cwd: root, stdio: 'ignore'});
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
await wait(1200);
const browser = spawn(edge, [`--headless=new`, `--remote-debugging-port=9226`, `--user-data-dir=${profile}`, '--no-first-run', 'about:blank'], {stdio: 'ignore'});
await wait(1000);
const target = (await (await fetch('http://localhost:9226/json')).json()).find(item => item.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl); let id = 0; const pending = new Map();
ws.addEventListener('message', event => {const message = JSON.parse(event.data); if (message.id && pending.has(message.id)) {pending.get(message.id)(message); pending.delete(message.id);}});
const call = (method, params = {}) => new Promise(resolve => {const request = ++id; pending.set(request, resolve); ws.send(JSON.stringify({id: request, method, params}));});
await new Promise(resolve => ws.addEventListener('open', resolve, {once: true}));
await call('Network.enable'); await call('Page.enable'); await call('Network.emulateNetworkConditions', {offline: false, latency: 150, downloadThroughput: 160 * 1024, uploadThroughput: 75 * 1024});
const urls = ['http://localhost:3100/', 'http://localhost:3100/packs/cocina']; const results = [];
for (const url of urls) {
  await call('Page.navigate', {url}); await wait(2200);
  const evaluated = await call('Runtime.evaluate', {returnByValue: true, awaitPromise: true, expression: `(() => { const resources = performance.getEntriesByType('resource'); const lcp = performance.getEntriesByType('largest-contentful-paint').at(-1); const shifts = performance.getEntriesByType('layout-shift').filter(e => !e.hadRecentInput).reduce((sum,e) => sum + e.value, 0); const js = resources.filter(e => e.name.endsWith('.js')).reduce((sum,e) => sum + (e.transferSize || 0), 0); return {requests: resources.length, jsBytes: js, lcpMs: lcp ? lcp.startTime : null, cls: shifts}; })()`});
  results.push({url, ...evaluated.result.result.value});
}
console.table(results.map(item => ({route: item.url.replace('http://localhost:3100', '') || '/', requests: item.requests, 'JS transfer KB': Math.round(item.jsBytes / 1024), 'LCP ms': item.lcpMs === null ? 'n/a' : Math.round(item.lcpMs), CLS: item.cls.toFixed(3)})));
ws.close(); browser.kill(); server.kill(); try {fs.rmSync(profile, {recursive: true, force: true});} catch {}
