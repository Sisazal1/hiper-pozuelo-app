'use client';
import Link from 'next/link';
import {useEffect, useMemo, useState} from 'react';
import {packs} from '@/src/content/packs';
import {eur} from '@/src/lib/format';
import {total, type CartLine} from '@/src/lib/cart';
import {sendEvent} from '@/src/lib/session';
import {PackVisual} from '@/src/components/PackVisual';
import {QuantityStepper} from '@/src/components/QuantityStepper';
import {SummaryPanel} from '@/src/components/SummaryPanel';
import {Recommendations} from '@/src/components/Recommendations';

export default function Cart() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [undo, setUndo] = useState<{line: CartLine|null, timer: any}|null>(null);
  useEffect(() => {
    const raw = localStorage.getItem('cart');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setLines(parsed.map((item: any) => ({slug: item.slug || item.id, qty: Number(item.qty || item.quantity || 0)})).filter(l => l.slug));
      } else if (parsed && typeof parsed === 'object') {
        setLines(Object.entries(parsed).map(([slug, qty]) => ({slug, qty: Number(qty as any)})).filter(l => l.slug && l.qty > 0));
      }
    } catch {}
  }, []);
  const amount = useMemo(() => total(lines), [lines]);
  const save = (next: CartLine[]) => {
    setLines(next);
    const obj = Object.fromEntries(next.map(line => [line.slug, line.qty]));
    localStorage.setItem('cart', JSON.stringify(obj));
    try { window.dispatchEvent(new Event('cart:change')); } catch {}
  };
  if (!lines.length) return <main className="cart-page main wrap"><h1 className="h1">Tu carrito está vacío</h1><p>Elige uno de los cuatro packs: verás todo lo que entra antes de pagar.</p><Link className="btn" href="/packs">Ver los 4 packs</Link></main>;
  const cartSlugs = lines.map(l => l.slug);
  return <main className="cart-page main wrap"><h1 className="h1">Tu carrito</h1><div className="cart-layout"><section className="cart-lines">{lines.map(line => {const p = packs.find(item => item.slug === line.slug); if (!p) return null; return <article className="row cart-line" key={line.slug}><PackVisual slug={p.slug} units={p.units} size="small"/><div className="cart-line-copy"><h2>{p.name}</h2><p>{p.units} artículos</p></div><div className="cart-line-actions"><QuantityStepper value={line.qty} label={p.name} onDecrease={() => save(lines.map(item => item.slug === line.slug ? {...item, qty: Math.max(1, item.qty - 1)} : item))} onIncrease={() => save(lines.map(item => item.slug === line.slug ? {...item, qty: Math.min(5, item.qty + 1)} : item))} onRemove={() => {void sendEvent('cart_removed', {slug: line.slug}); const removed = line; const next = lines.filter(item => item.slug !== line.slug); save(next); if (undo?.timer) clearTimeout(undo.timer); const timer = setTimeout(() => setUndo(null), 5000); setUndo({line: removed, timer});}}/></div><strong className="line-price">{eur(p.priceCents * line.qty)}</strong></article>;})}<Link className="secondary-link" href="/packs">Añadir otro pack</Link></section><SummaryPanel amount={amount}/></div>{undo && undo.line ? <div className="undo-toast">Eliminado {packs.find(p=>p.slug===undo.line?.slug)?.name}. <button onClick={() => { if (undo.line) { const exists = lines.find(l=>l.slug===undo.line?.slug); if (exists) save(lines.map(l=>l.slug===undo.line?.slug?{...l,qty:undo.line.qty}:l)); else save([...lines, undo.line]); } if (undo.timer) clearTimeout(undo.timer); setUndo(null); }}>Deshacer</button></div> : null}<Recommendations cartSlugs={cartSlugs}/></main>;
}