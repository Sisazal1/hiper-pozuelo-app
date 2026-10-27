import test from 'node:test';
import assert from 'node:assert/strict';
import {addReview} from '../src/lib/reviews.ts';
import {database} from '../src/lib/db.ts';

test('only collected orders can review', () => {
  const db = database();
  db.prepare('INSERT INTO orders (order_ref,status,total_cents,contents_snapshot,name,phone,created_at) VALUES (?,?,?,?,?,?,?)').run('TEST1','pending',1000,'[]','x','123','2025-01-01');
  assert.throws(() => addReview('TEST1', 'bano', 5, 'ok'), /Solo pueden opinar/);
});

test('one review per order+pack', () => {
  const db = database();
  db.prepare('INSERT INTO orders (order_ref,status,total_cents,contents_snapshot,name,phone,created_at,collected_at) VALUES (?,?,?,?,?,?,?,?)').run('TEST2','collected',1000,'[]','x','123','2025-01-01','2025-01-02');
  addReview('TEST2', 'bano', 4, 'bien');
  assert.throws(() => addReview('TEST2', 'bano', 5, 'ok'), /Ya has valorado/);
});