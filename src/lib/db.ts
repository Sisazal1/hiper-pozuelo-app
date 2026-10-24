import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

let db: DatabaseSync | undefined;

const CREATE_SLOTS = 'CREATE TABLE IF NOT EXISTS slots (id TEXT PRIMARY KEY, starts_at TEXT, ends_at TEXT, capacity_units INTEGER, capacity_minutes INTEGER)';

const SCHEMA = `
PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, order_ref TEXT UNIQUE, status TEXT, total_cents INTEGER, contents_snapshot TEXT, pass_token_hash TEXT UNIQUE, pickup_code TEXT UNIQUE, name TEXT, phone TEXT, slot_id TEXT, slot_label TEXT, store_name TEXT, store_address TEXT, created_at TEXT, collected_at TEXT, dedupe_key TEXT);
CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY, order_id INTEGER, pack_slug TEXT, qty INTEGER);
${CREATE_SLOTS};
CREATE TABLE IF NOT EXISTS refunds (id INTEGER PRIMARY KEY, order_id INTEGER UNIQUE, reason TEXT, created_at TEXT);
CREATE TABLE IF NOT EXISTS staff_actions (id INTEGER PRIMARY KEY, order_id INTEGER, action TEXT, created_at TEXT);
`;

// The demo window, in UTC. Rendered through Europe/Madrid at format time (src/lib/slots.ts), so it
// reads 10:00–14:00 on a Saturday in either offset. capacity_minutes is ASSUMED: one packer, 4 h
// (business-strategy.md §20.3). capacity_units stays NULL = not enforced until Q5 has a number.
const DEMO_SLOT = {id: 'slot-1', startsAt: '2026-10-24T08:00:00.000Z', endsAt: '2026-10-24T12:00:00.000Z', capacityMinutes: 240};

function columns(conn: DatabaseSync, table: string) {
  return conn.prepare(`PRAGMA table_info(${table})`).all() as {name: string; type: string}[];
}

function hasColumn(conn: DatabaseSync, table: string, column: string) {
  return columns(conn, table).some(row => row.name === column);
}

// Migrations run on every open, so a database created by an earlier commit keeps working.
function migrate(conn: DatabaseSync) {
  if (!hasColumn(conn, 'orders', 'dedupe_key')) conn.exec('ALTER TABLE orders ADD COLUMN dedupe_key TEXT');
  // Partial on purpose: only a PENDING order reserves its key, so a refunded order can be placed
  // again with the same lines and a paid one is not blocked from a genuine second order.
  conn.exec(`CREATE UNIQUE INDEX IF NOT EXISTS orders_dedupe_pending ON orders(dedupe_key) WHERE dedupe_key IS NOT NULL AND status='pending'`);

  if (!hasColumn(conn, 'slots', 'capacity_minutes')) conn.exec('ALTER TABLE slots ADD COLUMN capacity_minutes INTEGER');
  // An earlier commit declared `slots.id INTEGER PRIMARY KEY`, which cannot hold the 'slot-1' that
  // orders.slot_id already carries. Rebuilt in place with the rows copied, not dropped.
  const idType = (columns(conn, 'slots').find(row => row.name === 'id')?.type ?? '').toUpperCase();
  if (idType !== 'TEXT') {
    conn.exec('ALTER TABLE slots RENAME TO slots_legacy');
    conn.exec(CREATE_SLOTS);
    conn.exec('INSERT INTO slots (id, starts_at, ends_at, capacity_units, capacity_minutes) SELECT CAST(id AS TEXT), starts_at, ends_at, capacity_units, capacity_minutes FROM slots_legacy');
    conn.exec('DROP TABLE slots_legacy');
  }

  const existing = conn.prepare('SELECT COUNT(*) AS n FROM slots').get() as {n: number};
  if (existing.n === 0) {
    conn.prepare('INSERT INTO slots (id,starts_at,ends_at,capacity_units,capacity_minutes) VALUES (?,?,?,?,?)')
      .run(DEMO_SLOT.id, DEMO_SLOT.startsAt, DEMO_SLOT.endsAt, null, DEMO_SLOT.capacityMinutes);
  }
}

export function database() {
  if (!db) {
    const file = path.resolve(process.env.DATABASE_PATH ?? 'data/hiper-pozuelo.db');
    fs.mkdirSync(path.dirname(file), {recursive: true});
    db = new DatabaseSync(file);
    db.exec(SCHEMA);
    migrate(db);
  }
  return db;
}

export function resetDatabase() {
  db?.close();
  db = undefined;
}
