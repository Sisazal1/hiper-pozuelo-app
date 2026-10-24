'use client';
import {useEffect, useState} from 'react';
export function CartBadge() {
  const [count, setCount] = useState(0);
  useEffect(() => { try { const raw = window.localStorage.getItem('cart'); const parsed = raw ? JSON.parse(raw) : []; setCount(Array.isArray(parsed) ? parsed.reduce((sum, item) => sum + Number(item?.quantity ?? item?.qty ?? 0), 0) : 0); } catch { setCount(0); } }, []);
  return <span className="cart-badge" aria-label={`${count} artículos`}>{count}</span>;
}
