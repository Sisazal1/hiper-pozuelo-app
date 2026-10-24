import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

let db: DatabaseSync | undefined;

const SCHEMA = `
PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, order_ref TEXT UNIQUE, status TEXT, total_cents INTEGER, contents_snapshot TEXT, pass_token_hash TEXT UNIQUE, pickup_code TEXT UNIQUE, name TEXT, phone TEXT, slot_id TEXT, slot_label TEXT, store_name TEXT, store_address TEXT, created_at TEXT, collected_at TEXT, dedupe_key TEXT);
CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY, order_id INTEGER, pack_slug TEXT, qty INTEGER);
CREATE TABLE IF NOT EXISTS slots (id INTEGER PRIMARY KEY, starts_at TEXT, ends_at TEXT, capacity_units INTEGER);
CREATE TABLE IF NOT EXISTS refunds (id INTEGER PRIMARY KEY, order_id INTEGER UNIQUE, reason TEXT, created_at TEXT);
CREATE TABLE IF NOT EXISTS staff_actions (id INTEGER PRIMARY KEY, order_id INTEGER, action TEXT, created_at TEXT);
`;

function hasColumn(conn: DatabaseSync, table: string, column: string) {
  const rows = conn.prepare(`PRAGMA table_info(${table})`).all() as {name: string}[];
  return rows.some(row => row.name === column);
}

// Migrations run on every open, so a database created by an earlier commit keeps working.
function migrate(conn: DatabaseSync) {
  if (!hasColumn(conn, 'orders', 'dedupe_key')) conn.exec('ALTER TABLE orders ADD COLUMN dedupe_key TEXT');
  // Partial on purpose: only a PENDING order reserves its key, so a refunded order can be placed
  // again with the same lines and a paid one is not blocked from a genuine second order.
  conn.exec(`CREATE UNIQUE INDEX IF NOT EXISTS orders_dedupe_pending ON orders(dedupe_key) WHERE dedupe_key IS NOT NULL AND status='pending'`);
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
