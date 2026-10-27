'use client';
import {getRecommendations} from '@/src/lib/recommendations';
import {eur} from '@/src/lib/format';
import Link from 'next/link';

export function Recommendations({currentSlug, cartSlugs, onAdd}: {currentSlug?: string; cartSlugs?: string[]; onAdd?: (rec: any) => void}) {
  const recs = getRecommendations({currentSlug, cartSlugs});
  if (recs.length === 0) return null;
  return <section className=\"recs\"><h2 className=\"h2\">Te puede interesar</h2><div className=\"recs-grid\">{recs.map((r, i) => <article className=\"rec-card\" key={i}><p className=\"rec-reason\">{r.reason}</p>{r.highlight ? <p className=\"rec-highlight\">{r.highlight}</p> : null}<p className=\"rec-price\">{eur(r.priceCents)}</p>{r.slug ? <Link className=\"btn secondary\" href={'/packs/' + r.slug}>Ver {r.slug === 'completo' ? 'pack completo' : 'pack'}</Link> : null}{r.addonId ? <button className=\"btn secondary\" onClick={() => onAdd && onAdd(r)}>Añadir</button> : null}</article>)}</div></section>;
}