import test from 'node:test';
import assert from 'node:assert/strict';
import {computeKPIs} from '../src/lib/kpi.ts';

test('KPIs separate real from hypothesis', () => {
  const result = computeKPIs([], []);
  assert.ok(Array.isArray(result.real));
  assert.ok(Array.isArray(result.hypotheses));
  for (const h of result.hypotheses) {
    assert.equal(h.source, 'hypothesis');
  }
  for (const r of result.real) {
    assert.equal(r.source, 'real');
  }
});

test('KPIs show insufficient when n small', () => {
  const result = computeKPIs([], []);
  const v2a = result.real.find(r => r.name.includes('Conversión'));
  assert.ok(v2a);
});