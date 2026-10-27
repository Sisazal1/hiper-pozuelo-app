import Link from 'next/link';
import {packs} from '@/src/content/packs';
import {eur} from '@/src/lib/format';
import {availabilityLabel} from '@/src/content/availability';
import {PRICE_LABEL} from '@/src/content/price';
import {PackVisual} from '@/src/components/PackVisual';
import {JsonLd} from '@/src/components/JsonLd';
import {SITE_URL} from '@/src/content/site';
import {copyFor, type Lang} from '@/src/content/lang';
import type {Metadata} from 'next';

export const metadata: Metadata = {title: 'Packs para estudiantes', description: 'Cuatro packs para tu primer día de piso.', alternates: {canonical: '/'}};
const QUESTIONS = [
  ['¿Enviáis a casa o solo se recoge?', 'No. Solo se recoge en tienda, en la franja que elijas. No hay envío.'],
  ['¿Cuánto tarda la recogida?', 'Eliges día y hora al pagar y lo preparamos antes de que llegues. No hay espera de reparto.'],
  ['¿Puedo devolverlo?', 'Sí, tienes 14 días desde la recogida. Las condiciones están en Condiciones de compra.'],
  ['¿Y si no puedo ir a recogerlo?', 'Puede venir otra persona con tu código. Si se te pasa la franja, el pedido caduca y los artículos vuelven a estar disponibles.']
] as const;
function Icon({kind}: {kind: 'choose' | 'clock' | 'code'}) { return <svg className="step-icon" viewBox="0 0 48 48" aria-hidden="true"><path d={kind === 'choose' ? 'M8 12h32v24H8zM14 18h20M14 25h12' : kind === 'clock' ? 'M24 8a16 16 0 1 0 0 32 16 16 0 0 0 0-32Zm0 8v9l6 4' : 'M12 17h24v20H12zM16 17v-3a8 8 0 0 1 16 0v3M19 27h10'} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
export default function Home({searchParams}: {searchParams?: Promise<{lang?: string}>}) { return <HomeContent searchParams={searchParams}/>; }
async function HomeContent({searchParams}: {searchParams?: Promise<{lang?: string}>}) {
  const lang = (await searchParams)?.lang === 'en' ? 'en' : 'es'; const c = copyFor(lang as Lang); const featured = packs.find(p => p.slug === 'completo') ?? packs[0];
  return <><JsonLd data={{'@context': 'https://schema.org', '@type': 'Organization', name: 'Hiper Pozuelo', url: SITE_URL, areaServed: 'Pozuelo de Alarcón'}}/><main className="home-narrative">
    <section className="home-hero wrap" aria-labelledby="home-title"><div className="hero-copy"><p className="eyebrow">{c.packs}</p><h1 id="home-title">{c.homeTitle}</h1><p className="hero-subtitle">{c.homeLead}</p><Link className="btn" href="/packs">{c.viewPacks}</Link></div><div className="hero-visual"><PackVisual slug={featured.slug} units={featured.units} size="hero"/></div></section>
    <section className="fill-story" aria-labelledby="fill-title"><div className="fill-short wrap"><div className="fill-intro"><p className="eyebrow">{featured.name}</p><h2 id="fill-title">El pack se llena.</h2><p>Todo lo que necesitas, reunido en una sola compra.</p><p className="fill-total"><strong>{featured.units} artículos</strong><span>{eur(featured.priceCents)}</span></p></div><ul className="fill-figures">{featured.groups.map(group => <li key={group.name}><strong>{group.units}</strong><span>{group.name}</span></li>)}</ul></div></section>
    <section className="home-section wrap fill-list" aria-labelledby="fill-list-title"><div className="section-heading"><p className="eyebrow">{featured.name}</p><h2 id="fill-list-title">Qué entra</h2><p>{featured.units} artículos · {eur(featured.priceCents)}</p></div><div className="fill-groups">{featured.groups.map(group => <details className="contents-panel" key={group.name}><summary><span>{group.name}</span><span className="contents-count">{group.units} artículos</span></summary><ul>{group.items.map(item => <li key={item.item}><span>{item.item}</span><b>×{item.qty}</b></li>)}</ul></details>)}</div></section>
    <section className="home-section wrap" aria-labelledby="packs-heading"><div className="section-heading"><p className="eyebrow">Compara y elige</p><h2 id="packs-heading">Los 4 packs</h2></div><div className="home-pack-grid">{packs.map(p => <article className="home-pack-card" key={p.slug}><PackVisual slug={p.slug} units={p.units}/><div className="home-pack-body"><div className="home-pack-heading"><h3>{p.name}</h3><strong className="price">{eur(p.priceCents)}</strong></div><span className="availability" data-availability={p.availability}>{lang === 'en' ? c.availability[p.availability as keyof typeof c.availability] : availabilityLabel(p.availability)}</span><p className="pack-summary">{p.units} artículos · {p.groups.length} {p.groups.length === 1 ? 'grupo' : 'grupos'}</p><ul className="pack-includes">{p.groups[0]?.items.slice(0, 3).map(item => <li key={item.item}>{item.item} ×{item.qty}</li>)}</ul><span className="label">{PRICE_LABEL[p.dataStatus]}</span><Link className="btn secondary" href={`/packs/${p.slug}`}>{c.viewPack}</Link></div></article>)}</div></section>
    <section id="como-funciona" className="home-section wrap" aria-labelledby="how-title"><div className="section-heading"><p className="eyebrow">Sin complicaciones</p><h2 id="how-title">Cómo funciona</h2><p>Recogida gratis en tienda, sin envíos.</p></div><ol className="how-grid"><li><Icon kind="choose"/><span className="step-number">01</span><h3>Elige tu pack</h3><p>Tienes cuatro: baño, cocina, habitación y completo.</p></li><li><Icon kind="clock"/><span className="step-number">02</span><h3>Paga una vez</h3><p>Precio con IVA incluido, sin coste añadido. En la demo el pago es simulado.</p></li><li><Icon kind="code"/><span className="step-number">03</span><h3>Recoge con un código</h3><p>Te damos un código de 6 caracteres. Con eso basta en el mostrador.</p></li></ol></section>
    <section className="pickup-block wrap" aria-labelledby="pickup-title"><div><p className="eyebrow">Recogida</p><h2 id="pickup-title">Dónde lo recoges</h2><p>Recogida en tienda. Sin envíos.</p></div><div className="pending-address">Recogida en tienda — te confirmamos la dirección al preparar el pedido.</div></section>
    <section className="home-section wrap" aria-labelledby="faq-title"><div className="section-heading"><p className="eyebrow">Antes de comprar</p><h2 id="faq-title">Preguntas frecuentes</h2></div><div className="home-faq">{QUESTIONS.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></section>
    <section className="home-close wrap"><h2>Todo listo para tu primer día.</h2><p>Elige tu pack y mira todo lo que entra antes de pagar.</p><Link className="btn" href="/packs">{c.viewPacks}</Link></section>
  </main></>;
}
