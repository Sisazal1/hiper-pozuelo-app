export type Review = {
  id: number;
  orderRef: string;
  packSlug: string;
  rating: number;
  comment: string;
  createdAt: string;
  verified: boolean;
};

import {database} from './db.ts';

function ensureTable() {
  const db = database();
  db.exec('CREATE TABLE IF NOT EXISTS reviews (' +
    'id INTEGER PRIMARY KEY, ' +
    'order_ref TEXT, ' +
    'pack_slug TEXT, ' +
    'rating INTEGER CHECK(rating >= 1 AND rating <= 5), ' +
    'comment TEXT, ' +
    'created_at TEXT, ' +
    'verified INTEGER DEFAULT 1, ' +
    'UNIQUE(order_ref, pack_slug)' +
    ')');
}

export function addReview(orderRef: string, packSlug: string, rating: number, comment: string) {
  ensureTable();
  const db = database();
  const row = db.prepare('SELECT status FROM orders WHERE order_ref=?').get(orderRef) as any;
  if (!row) throw new Error('Pedido no encontrado');
  if (row.status !== 'collected') throw new Error('Solo pueden opinar quienes ya han recogido su pedido');
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error('Valoración inválida');
  const stmt = db.prepare('INSERT INTO reviews (order_ref, pack_slug, rating, comment, created_at, verified) VALUES (?,?,?,?,?,1)');
  try {
    const now = new Date().toISOString();
    stmt.run(orderRef, packSlug, rating, (comment || '').trim(), now);
    return {ok: true};
  } catch (e) {
    throw new Error('Ya has valorado este pack para este pedido');
  }
}

export function getReviewsForPack(packSlug: string): Review[] {
  ensureTable();
  const db = database();
  const rows = db.prepare('SELECT * FROM reviews WHERE pack_slug=? ORDER BY created_at DESC').all(packSlug) as any[];
  return rows.map((r: any) => ({id: r.id, orderRef: r.order_ref, packSlug: r.pack_slug, rating: r.rating, comment: r.comment, createdAt: r.created_at, verified: r.verified === 1}));
}

export function getReviewSummary(packSlug: string) {
  ensureTable();
  const db = database();
  const rows = db.prepare('SELECT rating, COUNT(*) as c FROM reviews WHERE pack_slug=? GROUP BY rating').all(packSlug) as any[];
  const total = rows.reduce((s: number, r: any) => s + Number(r.c), 0);
  if (total === 0) return {total: 0, average: 0, distribution: {1:0,2:0,3:0,4:0,5:0}};
  const sum = rows.reduce((s: number, r: any) => s + Number(r.rating) * Number(r.c), 0);
  const dist: any = {1:0,2:0,3:0,4:0,5:0};
  for (const r of rows) dist[r.rating] = Number(r.c);
  return {total, average: sum / total, distribution: dist};
}