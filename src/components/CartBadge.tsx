'use client';
import {useEffect, useState} from 'react';

function countCart() {
  try {
    const raw = window.localStorage.getItem('cart');
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.reduce((sum, item) => sum + Number(item?.quantity ?? item?.qty ?? 0), 0);
    }
    if (parsed && typeof parsed === 'object') {
      return Object.values(parsed).reduce((sum: number, qty: any) => sum + Number(qty || 0), 0);
    }
    return 0;
  } catch {
    return 0;
  }
}

export function CartBadge() {
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const read = () => { setCount(countCart()); };
    read();
    setMounted(true);
    window.addEventListener('storage', read);
    window.addEventListener('cart:change', read);
    return () => { window.removeEventListener('storage', read); window.removeEventListener('cart:change', read); };
  }, []);
  if (!mounted) return <span className="cart-badge" aria-live="polite" aria-label="0 artículos en el carrito"></span>;
  return <span className="cart-badge" aria-live="polite" aria-label={count + ' artículos en el carrito'}>{count > 0 ? count : null}</span>;
}