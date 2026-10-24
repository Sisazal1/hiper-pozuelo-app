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

export default function Cart() {
  const [lines, setLines] = useState<CartLine[]>([]);
  useEffect(() => {const raw = JSON.parse(localStorage.getItem('cart') || '{}'); setLines(Object.entries(raw).map(([slug, qty]) => ({slug, qty: Number(qty)})));}, []);
  const amount = useMemo(() => total(lines), [lines]);
  const save = (next: CartLine[]) => {setLines(next); localStorage.setItem('cart', JSON.stringify(Object.fromEntries(next.map(line => [line.slug, line.qty]))));};
  if (!lines.length) return <main className="cart-page main wrap"><h1 className="h1">Tu carrito está vacío</h1><p>Elige uno de los cuatro packs: verás todo lo que entra antes de pagar.</p><Link className="btn" href="/packs">Ver los 4 packs</Link></main>;
  return <main className="cart-page main wrap"><h1 className="h1">Tu carrito</h1><div className="cart-layout"><section className="cart-lines">{lines.map(line => {const p = packs.find(item => item.slug === line.slug); if (!p) return null; return <article className="row cart-line" key={line.slug}><PackVisual slug={p.slug} units={p.units} size="small"/><div className="cart-line-copy"><h2>{p.name}</h2><p>{p.units} artículos</p></div><QuantityStepper value={line.qty} label={p.name} onDecrease={() => save(lines.map(item => item.slug === line.slug ? {...item, qty: item.qty - 1} : item))} onIncrease={() => save(lines.map(item => item.slug === line.slug ? {...item, qty: item.qty + 1} : item))} onRemove={() => {void sendEvent('cart_removed', {slug: line.slug}); save(lines.filter(item => item.slug !== line.slug));}}/><strong className="line-price">{eur(p.priceCents * line.qty)}</strong></article>;})}<Link className="secondary-link" href="/packs">Añadir otro pack</Link></section><SummaryPanel amount={amount}/></div></main>;
}
