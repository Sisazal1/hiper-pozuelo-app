import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {AVAILABILITY_LABEL, availabilityLabel} from '../src/content/availability.ts';

const packs = JSON.parse(fs.readFileSync('src/content/packs.generated.json'));

test('the three R-004 states have three distinct labels', () => {
  assert.deepEqual(Object.keys(AVAILABILITY_LABEL).sort(), ['in_stock', 'low_stock', 'sold_out']);
  assert.equal(availabilityLabel('in_stock'), 'Disponible');
  assert.equal(availabilityLabel('low_stock'), 'Últimas unidades');
  assert.equal(availabilityLabel('sold_out'), 'Agotado');
  assert.equal(new Set(Object.values(AVAILABILITY_LABEL)).size, 3);
});

test('an unknown state fails closed instead of rendering as available', () => {
  assert.throws(() => availabilityLabel('agotadisimo'), /sin etiqueta/);
  assert.throws(() => availabilityLabel(''), /sin etiqueta/);
});

test('every pack in the data carries one of the three states', () => {
  for (const pack of packs) assert.ok(Object.keys(AVAILABILITY_LABEL).includes(pack.availability), `${pack.slug}: ${pack.availability}`);
});

test('both listings publish the state as an attribute, not just as words', () => {
  for (const file of ['app/page.tsx', 'app/packs/[slug]/page.tsx']) {
    const source = fs.readFileSync(file, 'utf8');
    assert.match(source, /className="availability" data-availability=\{p\.availability\}/, `${file} carries data-availability`);
    assert.match(source, /availabilityLabel\(p\.availability\)/, `${file} derives the label from the data`);
  }
});

test('the stylesheet has one rule per state', () => {
  const css = fs.readFileSync('app/globals.css', 'utf8');
  for (const state of ['in_stock', 'low_stock', 'sold_out']) {
    assert.match(css, new RegExp(`\\.availability\\[data-availability="${state}"\\]`), `missing rule for ${state}`);
  }
});
