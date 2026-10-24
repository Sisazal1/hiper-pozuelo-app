import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ASSEMBLY_MINUTES, requiredMinutes, fits} from '../src/content/capacity.ts';
import {slotLabel} from '../src/lib/slots.ts';

// The map is only allowed to say what the sheet says: parsed by header name, never by column
// position, and compared row by row so a change to the CSV fails here instead of in a window.
const rows = fs.readFileSync('data/pack-price-sheet.csv', 'utf8').split(/\r?\n/).filter(Boolean).map(line => line.split(','));
const header = rows[0];
const packIdAt = header.indexOf('pack_id');
const minutesAt = header.indexOf('pack_assembly_minutes');
const fromSheet = {};
for (const row of rows.slice(1)) {
  const id = row[packIdAt];
  const minutes = row[minutesAt];
  if (fromSheet[id] === undefined) fromSheet[id] = Number(minutes);
  assert.equal(Number(minutes), fromSheet[id], `${id}: pack_assembly_minutes differs between rows of the same pack`);
}

test('ASSEMBLY_MINUTES matches data/pack-price-sheet.csv row by row', () => {
  assert.deepEqual({...ASSEMBLY_MINUTES}, fromSheet);
  assert.equal(header[minutesAt], 'pack_assembly_minutes');
});

test('required minutes are assembly minutes times quantity', () => {
  assert.equal(requiredMinutes([{slug: 'bano', qty: 1}]), 8);
  assert.equal(requiredMinutes([{slug: 'completo', qty: 5}]), 90);
  assert.equal(requiredMinutes([{slug: 'bano', qty: 2}, {slug: 'cocina', qty: 1}]), 26);
  assert.throws(() => requiredMinutes([{slug: 'no-existe', qty: 1}]), /Sin minutos de montaje/);
});

// R-042b: a three-unit window. Refused with a reason, never truncated, never accepted.
test('a three-unit window refuses five, accepts three and refuses one more (R-042b)', () => {
  const window = {minutes: null, units: 3};
  const empty = {minutes: 0, units: 0};
  const five = fits(window, empty, {minutes: 40, units: 5});
  assert.equal(five.ok, false);
  assert.equal(five.reason, 'units');
  assert.match(five.message, /Elige otra hora/);
  const three = fits(window, empty, {minutes: 24, units: 3});
  assert.equal(three.ok, true);
  const oneMore = fits(window, {minutes: 24, units: 3}, {minutes: 8, units: 1});
  assert.equal(oneMore.ok, false);
  assert.equal(oneMore.reason, 'units');
});

// R-041 (r11) / R-042b: the seeded window is 190 minutes, and the ceiling is reached exactly rather
// than approached. The minutes are derived from the sheet, so this test moves with the CSV and not
// with a number typed twice.
test('the pilot window: 190 minutes takes the at-the-cap cart and refuses 198', () => {
  const atTheCap = [{slug: 'completo', qty: 5}, {slug: 'habitacion', qty: 5}, {slug: 'cocina', qty: 5}];
  assert.equal(requiredMinutes(atTheCap), 190);
  const withBano = [...atTheCap, {slug: 'bano', qty: 1}];
  assert.equal(requiredMinutes(withBano), 198);
  const window = {minutes: 190, units: null};
  const empty = {minutes: 0, units: 0};
  const cap = fits(window, empty, {minutes: requiredMinutes(atTheCap), units: 0});
  assert.equal(cap.ok, true);
  const after = fits(window, {minutes: requiredMinutes(atTheCap), units: 0}, {minutes: 8, units: 1});
  assert.equal(after.ok, false);
  assert.equal(after.reason, 'minutes');
  assert.equal(after.message, 'Esta franja no tiene capacidad para ese pedido. Elige otra hora.');
});

test('a null limit is not enforced, which is how Q5 stays open', () => {
  assert.equal(fits({minutes: null, units: null}, {minutes: 0, units: 0}, {minutes: 999, units: 999}).ok, true);
});

// R-095: the same wall clock on both sides of the October change.
test('slot label resolves through Europe/Madrid across the DST change', () => {
  const cestSaturday = slotLabel('2026-10-24T08:00:00.000Z', '2026-10-24T12:00:00.000Z');   // UTC+2
  const cetSunday = slotLabel('2026-10-25T09:00:00.000Z', '2026-10-25T13:00:00.000Z');       // UTC+1
  assert.match(cestSaturday, /10:00–14:00/);
  assert.match(cetSunday, /10:00–14:00/);
  assert.match(cestSaturday, /sábado/);
  assert.match(cetSunday, /domingo/);
  assert.throws(() => slotLabel('2026-10-24T12:00:00.000Z', '2026-10-24T08:00:00.000Z'), /terminar antes de empezar/);
  assert.throws(() => slotLabel('no-es-una-fecha', '2026-10-24T08:00:00.000Z'), /no válidas/);
});
