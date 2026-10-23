import fs from 'node:fs'; import path from 'node:path';
export type EventName='pack_view'|'add_to_cart'|'cart_removed'|'checkout_start'|'checkout_step_viewed'|'slot_selected'|'payment_succeeded'|'payment_failed'|'order_collected'|'session_source';
export function recordEvent(name:EventName,payload:Record<string,unknown>){const line=JSON.stringify({name,payload:{...payload,session_id:payload.session_id??'server-session'}}); const file=path.resolve(process.env.EVENT_LOG_PATH??'data/events.log'); fs.mkdirSync(path.dirname(file),{recursive:true}); fs.appendFileSync(file,line+'\n')}
