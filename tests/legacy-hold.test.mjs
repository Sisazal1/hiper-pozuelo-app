import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {holdExpiresAt, holdIsActive} from '../src/lib/hold.ts';
import {database, resetDatabase} from '../src/lib/db.ts';

// R-049 (r3), D-065 §2: the defect was not in the predicate's direction of safety but in its
// duration. A `pending` row written before `hold_expires_at` existed counted as active for ever, so
// one legacy row closed the window permanently and `refund` refuses what was never paid — staff had
// no remedy on any surface. This test opens a database in the pre-R-049 shape and reads it back.

const PRE_R049_ORDERS = 'CREATE TABLE orders (id INTEGER PRIMARY KEY, order_ref TEXT UNIQUE, status TEXT, total_cents INTEGER, contents_snapshot TEXT, pass_token_hash TEXT UNIQUE, pickup_code TEXT UNIQUE, name TEXT, phone TEXT, slot_id TEXT, slot_label TEXT, store_name TEXT, store_address TEXT, created_at TEXT, collected_at TEXT, dedupe_key TEXT)';
const SLOTS = 'CREATE TABLE slots (id TEXT PRIMARY KEY, starts_at TEXT, ends_at TEXT, capacity_units INTEGER, capacity_minutes INTEGER)';

function legacyDatabase(rows) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hz-legacy-'));
  const file = path.join(dir, 'legacy.db');
  const conn = new DatabaseSync(file);
  conn.exec(PRE_R049_ORDERS);
  conn.exec(SLOTS);
  conn.prepare('INSERT INTO slots (id,starts_at,ends_at,capacity_units,capacity_minutes) VALUES (?,?,?,?,?)')
    .run('slot-1', '2026-10-24T08:00:00.000Z', '2026-10-24T12:00:00.000Z', null, 190);
  const insert = conn.prepare('INSERT INTO orders (order_ref,status,total_cents,contents_snapshot,name,phone,slot_id,created_at) VALUES (?,?,?,?,?,?,?,?)');
  for (const row of rows) insert.run(row.ref, row.status, 3290, JSON.stringify([{slug: 'completo', qty: 5}]), 'Vieja R.', '600000001', 'slot-1', row.createdAt);
  conn.close();
  return file;
}

test('a pre-R-049 pending row is retired on open, and its minutes come back (R-049 r3)', () => {
  const hoursAgo = hours => new Date(Date.now() - hours * 3_600_000).toISOString();
  const file = legacyDatabase([{ref: 'HZ-LEGACY', status: 'pending', createdAt: hoursAgo(3)}]);
  process.env.DATABASE_PATH = file;
  resetDatabase();
  try {
    const conn = database();
    const row = conn.prepare(`SELECT status, hold_expires_at, created_at FROM orders WHERE order_ref='HZ-LEGACY'`).get();
    // The clock started when the order was created, not when the migration ran.
    assert.equal(row.hold_expires_at, holdExpiresAt(row.created_at));
    assert.equal(row.status, 'expired');
    assert.equal(holdIsActive(row.status, row.hold_expires_at, new Date(), row.created_at), false);
    // 90 of the window's 190 minutes are free again: the predicate agrees at the window's edge.
    assert.equal(holdIsActive('pending', null, new Date(), hoursAgo(3)), false);
  } finally {
    resetDatabase();
    delete process.env.DATABASE_PATH;
  }
});

test('a legacy hold still inside its ten minutes is kept, not retired (R-049 r3)', () => {
  const file = legacyDatabase([{ref: 'HZ-FRESH', status: 'pending', createdAt: new Date(Date.now() - 60_000).toISOString()}]);
  process.env.DATABASE_PATH = file;
  resetDatabase();
  try {
    const row = database().prepare(`SELECT status, hold_expires_at FROM orders WHERE order_ref='HZ-FRESH'`).get();
    assert.equal(row.status, 'pending');
    assert.ok(new Date(row.hold_expires_at).getTime() > Date.now(), 'a fresh legacy row lost its hold');
  } finally {
    resetDatabase();
    delete process.env.DATABASE_PATH;
  }
});

test('a pending row with no creation date cannot hold anything (R-049 r3)', () => {
  const file = legacyDatabase([{ref: 'HZ-UNDATED', status: 'pending', createdAt: null}]);
  process.env.DATABASE_PATH = file;
  resetDatabase();
  try {
    const row = database().prepare(`SELECT status, hold_expires_at FROM orders WHERE order_ref='HZ-UNDATED'`).get();
    assert.equal(row.status, 'expired');
    assert.equal(row.hold_expires_at, null);
    assert.equal(holdIsActive('pending', null, new Date(), null), false);
  } finally {
    resetDatabase();
    delete process.env.DATABASE_PATH;
  }
});
