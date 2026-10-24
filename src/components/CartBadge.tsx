'use client';
import {useEffect, useState} from 'react';
export function CartBadge() {
  const [count, setCount] = useState(0); const [mounted, setMounted] = useState(false);
  useEffect(() => { const read = () => {try { const raw = window.localStorage.getItem('cart'); const parsed = raw ? JSON.parse(raw) : []; setCount(Array.isArray(parsed) ? parsed.reduce((sum, item) => sum + Number(item?.quantity ?? item?.qty ?? 0), 0) : 0); } catch { setCount(0); }}; read(); setMounted(true); window.addEventListener('storage', read); window.addEventListener('cart:change', read); return () => {window.removeEventListener('storage', read);window.removeEventListener('cart:change', read)}; }, []);
  return <span className="cart-badge" aria-live="polite" aria-label={mounted ? `${count} artículos en el carrito` : undefined}>{mounted && count > 0 ? count : null}</span>;
}
