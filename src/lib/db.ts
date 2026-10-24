import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

let db: DatabaseSync | undefined;

const CREATE_SLOTS = 'CREATE TABLE IF NOT EXISTS slots (id TEXT PRIMARY KEY, starts_at TEXT, ends_at TEXT, capacity_units INTEGER, capacity_minutes INTEGER)';

const SCHEMA = `
PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, order_ref TEXT UNIQUE, status TEXT, total_cents INTEGER, contents_snapshot TEXT, pass_token_hash TEXT UNIQUE, pickup_code TEXT UNIQUE, name TEXT, phone TEXT, slot_id TEXT, slot_label TEXT, store_name TEXT, store_address TEXT, created_at TEXT, collected_at TEXT, dedupe_key TEXT, hold_expires_at TEXT);
CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY, order_id INTEGER, pack_slug TEXT, qty INTEGER);
${CREATE_SLOTS};
CREATE TABLE IF NOT EXISTS refunds (id INTEGER PRIMARY KEY, order_id INTEGER UNIQUE, reason TEXT, created_at TEXT);
CREATE TABLE IF NOT EXISTS staff_actions (id INTEGER PRIMARY KEY, order_id INTEGER, action TEXT, created_at TEXT);
`;

// The demo window, in UTC. Rendered through Europe/Madrid at format time (src/lib/slots.ts), so it
// reads 10:00–14:00 on a Saturday in either offset. capacity_minutes is ASSUMED: 190 assembly
// minutes for one packer (D-063 §6, business-strategy.md §20.3 — the 4 h figure was 2,29× the
// 105-minute default and made an 18-order launch day 104,2 % of the window it is sold against).
// capacity_units stays NULL = not enforced until Q5 has a number.
const DEMO_SLOT = {id: 'slot-1', startsAt: '2026-10-24T08:00:00.000Z', endsAt: '2026-10-24T12:00:00.000Z', capacityMinutes: 190};

function columns(conn: DatabaseSync, table: string) {
  return conn.prepare(`PRAGMA table_info(${table})`).all() as {name: string; type: string}[];
}

function hasColumn(conn: DatabaseSync, table: string, column: string) {
  return columns(conn, table).some(row => row.name === column);
}

// Migrations run on every open, so a database created by an earlier commit keeps working.
function migrate(conn: DatabaseSync) {
  if (!hasColumn(conn, 'orders', 'dedupe_key')) conn.exec('ALTER TABLE orders ADD COLUMN dedupe_key TEXT');
  // R-049: a pending order is a hold with an expiry, so an abandoned checkout cannot consume the
  // window forever. NULL means "no hold recorded" and is treated as active, never as expired.
  if (!hasColumn(conn, 'orders', 'hold_expires_at')) conn.exec('ALTER TABLE orders ADD COLUMN hold_expires_at TEXT');
  // B-2 (D-063): the key is held by a PENDING or a PAID order — keeping it on `paid` is what stops a
  // refresh after payment from minting a second order. Refunded, declined and expired release it.
  // The predicate changed and IF NOT EXISTS would retain the old definition, so the index is dropped
  // first: an index that silently keeps the old predicate is exactly the defect B-2 reported.
  conn.exec('DROP INDEX IF EXISTS orders_dedupe_pending');
  conn.exec(`CREATE UNIQUE INDEX IF NOT EXISTS orders_dedupe_pending ON orders(dedupe_key) WHERE dedupe_key IS NOT NULL AND status IN ('pending','paid')`);

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

  // M-3 (D-063): seeded by id, not by "the table is empty". A legacy database holding any unrelated
  // row used to boot with no slot-1 while the checkout posts slotId 'slot-1', so every order was
  // refused and deleting the file was the only way back.
  conn.prepare('INSERT OR IGNORE INTO slots (id,starts_at,ends_at,capacity_units,capacity_minutes) VALUES (?,?,?,?,?)')
    .run(DEMO_SLOT.id, DEMO_SLOT.startsAt, DEMO_SLOT.endsAt, null, DEMO_SLOT.capacityMinutes);
  // The capacity of slot-1 is a SEED, not business data: Profile A has no operator surface (D-005)
  // and the number is ASSUMED, so it is refreshed on every open when it differs. `IS NOT ?` is the
  // null-safe form — a database written at 240 by an earlier commit reads 190 as well, instead of
  // shipping two builds that disagree on the same digest. The day Simon edits a window's capacity
  // it becomes a table, not a constant.
  conn.prepare('UPDATE slots SET capacity_minutes=? WHERE id=? AND capacity_minutes IS NOT ?')
    .run(DEMO_SLOT.capacityMinutes, DEMO_SLOT.id, DEMO_SLOT.capacityMinutes);
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
