import Link from 'next/link';
import {PackVisual} from '@/src/components/PackVisual';
import {eur} from '@/src/lib/format';
import {PRICE_LABEL} from '@/src/content/price';
import {PROVENANCE_NOTE} from '@/src/content/disclosure';
import {availabilityLabel} from '@/src/content/availability';
import type {Pack} from '@/src/content/packs';

export function PackCard({p}: {p: Pack}) {
  return <article className="catalog-card"><PackVisual slug={p.slug} units={p.units}/><div className="catalog-card-body"><h2>{p.name}</h2><p className="muted">{p.benefit}</p><ul className="peek">{p.groups[0]?.items.slice(0, 3).map(item => <li key={item.item}>{item.item} ×{item.qty}</li>)}<li className="peek-more">y {Math.max(p.units - 3, 0)} más</li></ul><p className="price">{eur(p.priceCents)}</p><span className="availability" data-availability={p.availability}>{availabilityLabel(p.availability)}</span><span className="label">{PRICE_LABEL[p.dataStatus]}</span><p className="label">{PROVENANCE_NOTE}</p><Link className="btn secondary" href={`/packs/${p.slug}`}>Ver pack</Link></div></article>;
}

