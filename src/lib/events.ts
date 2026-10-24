import fs from 'node:fs';
import path from 'node:path';

export const EVENT_NAMES = ['pack_view','add_to_cart','cart_removed','checkout_start','checkout_step_viewed','slot_selected','payment_succeeded','payment_failed','order_collected','session_source'] as const;
export type EventName = typeof EVENT_NAMES[number];

// R-080 (r9): a session id is a UUID v4 minted into sessionStorage and nothing else. Any string
// would let a client collide two visitors into one session, or count itself as a cohort.
const SESSION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isSessionId(value: unknown): value is string {
  return typeof value === 'string' && SESSION_ID.test(value);
}

export function recordEvent(name: EventName, payload: Record<string, unknown>) {
  if (!isSessionId(payload.session_id)) throw Error('session_id debe ser un UUID v4');
  const file = path.resolve(process.env.EVENT_LOG_PATH ?? 'data/events.log');
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.appendFileSync(file, JSON.stringify({name, payload}) + '\n');
}

export function validEvent(name: string, payload: Record<string, unknown>) {
  if (!EVENT_NAMES.includes(name as EventName) || !isSessionId(payload.session_id)) return false;
  if (name === 'pack_view') return typeof payload.slug === 'string';
  if (name === 'add_to_cart') return typeof payload.slug === 'string' && Number.isInteger(payload.qty) && ['pack_page','addon_row'].includes(String(payload.source));
  if (name === 'cart_removed') return typeof payload.slug === 'string';
  if (name === 'checkout_step_viewed') return [1,2,3,4].includes(Number(payload.step));
  if (name === 'payment_failed') return typeof payload.order_ref === 'string';
  if (name === 'session_source') return typeof payload.source === 'string';
  return ['checkout_start','slot_selected','payment_succeeded','order_collected'].includes(name);
}
