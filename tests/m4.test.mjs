import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {holdExpiresAt, holdIsActive, HOLD_MINUTES_DEFAULT} from '../src/lib/hold.ts';
import {mergeLines, validQty} from '../src/lib/lines.ts';
import {slotLabel} from '../src/lib/slots.ts';

// These import the modules the app imports. The file this replaces compared literals to literals in
// six of its nine tests — a tautology named after a requirement (R-099b, D-063) — so those names are
// gone rather than kept as decoration. What a unit test cannot reach (createOrder, markPaid, the
// capacity wiring) is asserted over HTTP in scripts/flow.mjs, which runs as part of `verify`.

const packs = JSON.parse(fs.readFileSync('src/content/packs.generated.json'));

test('R-049 · the hold lasts the decided ten minutes', () => {
  assert.equal(HOLD_MINUTES_DEFAULT, 10);
  const created = '2026-10-24T08:00:00.000Z';
  assert.equal(holdExpiresAt(created), '2026-10-24T08:10:00.000Z');
  assert.equal(holdExpiresAt(created, 0), created);
  assert.throws(() => holdExpiresAt('no-es-una-fecha'), /no válida/);
});

test('R-049 · a pending order consumes the window only while its hold is alive', () => {
  const now = new Date('2026-10-24T08:05:00.000Z');
  assert.equal(holdIsActive('pending', '2026-10-24T08:10:00.000Z', now), true);
  assert.equal(holdIsActive('pending', '2026-10-24T08:01:00.000Z', now), false);
  // An order written before the column existed carries NULL: treated as active, never as expired.
  assert.equal(holdIsActive('pending', null, now), true);
});

test('R-049 · paid and collected consume forever, refunded/declined/expired never do', () => {
  const now = new Date('2026-10-24T08:05:00.000Z');
  assert.equal(holdIsActive('paid', '2026-10-24T08:01:00.000Z', now), true);
  assert.equal(holdIsActive('collected', null, now), true);
  for (const status of ['refunded', 'declined', 'expired']) {
    assert.equal(holdIsActive(status, '2099-01-01T00:00:00.000Z', now), false, status);
  }
});

test('m-1 · two lines of one pack merge into one line', () => {
  assert.deepEqual(mergeLines([{slug: 'completo', qty: 5}, {slug: 'completo', qty: 5}, {slug: 'completo', qty: 3}]), [{slug: 'completo', qty: 13}]);
  assert.deepEqual(mergeLines([{slug: 'bano', qty: 1}, {slug: 'cocina', qty: 2}, {slug: 'bano', qty: 1}]), [{slug: 'bano', qty: 2}, {slug: 'cocina', qty: 2}]);
  // The per-line bound still applies to what the customer sent, so 10 is only reachable as 5+5.
  assert.equal(validQty(10), false);
  assert.equal(mergeLines([{slug: 'completo', qty: 5}, {slug: 'completo', qty: 5}])[0].qty, 10);
});

test('R-095 · the window reads the same wall clock either side of the DST change', () => {
  const before = slotLabel('2026-10-24T08:00:00.000Z', '2026-10-24T12:00:00.000Z'); // CEST
  const after = slotLabel('2026-10-26T09:00:00.000Z', '2026-10-26T13:00:00.000Z');  // CET
  assert.match(before, /10:00–14:00/);
  assert.match(after, /10:00–14:00/);
  assert.match(before, /24 de octubre/);
  assert.match(after, /26 de octubre/);
});

test('m4 · the snapshot names the customer items, not a placeholder', () => {
  const ids = new Set(packs.flatMap(p => p.groups.flatMap(g => g.items.map(i => i.item))));
  assert.ok(ids.has('Toalla de baño 70x140 cm'));
  assert.equal(packs.find(p => p.slug === 'completo').units, 52);
});
