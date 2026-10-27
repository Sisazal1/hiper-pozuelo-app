import test from 'node:test';
import assert from 'node:assert/strict';
import {mergeLines} from '../src/lib/lines.ts';

test('merge lines with different variants stay separate', () => {
  const merged = mergeLines([{slug:'habitacion',qty:1,variant:'90'},{slug:'habitacion',qty:2,variant:'150'}]);
  assert.equal(merged.length, 2);
});

test('merge lines with same variant merge', () => {
  const merged = mergeLines([{slug:'habitacion',qty:1,variant:'90'},{slug:'habitacion',qty:1,variant:'90'}]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].qty, 2);
});