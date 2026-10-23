'use client';
export function sessionId(){const key='hiper-session-id';const existing=sessionStorage.getItem(key);if(existing)return existing;const id=crypto.randomUUID();sessionStorage.setItem(key,id);return id}
export async function sendEvent(name:string,payload:Record<string,unknown>){const id=sessionId();await fetch('/api/events',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name,payload:{...payload,session_id:id}})})}
