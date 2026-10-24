import {notFound} from 'next/navigation';
import Link from 'next/link';
import {getPack, packs} from '@/src/content/packs';
import {eur} from '@/src/lib/format';
import {PRICE_LABEL} from '@/src/content/price';
import {availabilityLabel} from '@/src/content/availability';
import {ContentsGroup} from '@/src/components/ContentsGroup';
import {AddToCartButton} from '@/src/components/AddToCartButton';
import {PackViewBeacon} from '@/src/components/PackViewBeacon';
import {PackPlate} from '@/src/components/PackPlate';
import {Breadcrumbs} from '@/src/components/Breadcrumbs';
import {StickyActionBar} from '@/src/components/StickyActionBar';
import {JsonLd} from '@/src/components/JsonLd';
import {SITE_URL} from '@/src/content/site';
import type {Metadata} from 'next';

export function generateStaticParams() {return packs.map(p => ({slug: p.slug}));}
export async function generateMetadata({params}: {params: Promise<{slug: string}>}): Promise<Metadata> {const {slug} = await params; const p = getPack(slug); if (!p) return {}; const url = `${SITE_URL}/packs/${slug}`; return {title: p.name, description: p.benefit, alternates: {canonical: url}, openGraph: {title: p.name, description: p.benefit, url, images: [{url: `${SITE_URL}/opengraph-image`}]}};}

export default async function Detail({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params; const p = getPack(slug); if (!p) notFound();
  const others = packs.filter(other => other.slug !== p.slug);
  const availability = p.availability === 'in_stock' ? 'https://schema.org/InStock' : p.availability === 'low_stock' ? 'https://schema.org/LimitedAvailability' : 'https://schema.org/OutOfStock';
  return <><JsonLd data={{'@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.benefit, sku: p.slug, brand: {'@type': 'Brand', name: 'Hiper Pozuelo'}, offers: {'@type': 'Offer', price: (p.priceCents / 100).toFixed(2), priceCurrency: 'EUR', availability, url: `${SITE_URL}/packs/${p.slug}`}}}/><main className="detail-page wrap"><PackViewBeacon slug={p.slug}/><Breadcrumbs trail={[{label: 'Inicio', href: '/'}, {label: 'Packs', href: '/packs'}, {label: p.name}]}/><div className="detail detail-layout"><section className="detail-buy"><h1 className="h1">{p.name}</h1><span className="availability" data-availability={p.availability}>{availabilityLabel(p.availability)}</span><p className="detail-price">{eur(p.priceCents)}</p><span className="label">{PRICE_LABEL[p.dataStatus]}</span><p className="detail-benefit">{p.benefit}</p><PackPlate units={p.units} size="large"/><div id="comprar" className="purchase-panel"><AddToCartButton slug={p.slug} price={eur(p.priceCents)}/><p>Recogida en tienda · Gratis</p><p>14 días para devolverlo</p></div><StickyActionBar slug={p.slug} price={eur(p.priceCents)} label="Comprar"/></section><section className="detail-content"><h2 className="h2">Qué entra</h2>{p.groups.map(group => <ContentsGroup key={group.name} {...group}/>)}<section className="not-included"><h2 className="h2">Qué no entra</h2>{p.notIncluded.length ? <ul>{p.notIncluded.map(item => <li key={item}>− {item}</li>)}</ul> : <p>Todo lo de los tres packs y la limpieza, en una sola compra.</p>}</section><section className="other-packs"><h2 className="h2">Añade otro pack</h2>{others.map(other => <Link className="other-pack-row" key={other.slug} href={`/packs/${other.slug}`}><span>{other.name}</span><span>{other.units} artículos</span><strong>{eur(other.priceCents)}</strong></Link>)}</section></section></div></main></>;
}

