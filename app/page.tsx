import Link from 'next/link';
import {packs} from '@/src/content/packs';
import {eur} from '@/src/lib/format';
import {availabilityLabel} from '@/src/content/availability';
import {PRICE_LABEL} from '@/src/content/price';
import {PackPlate} from '@/src/components/PackPlate';

export default function Home() {
  return <main className="site-home">
    <section data-block="2" className="home-block hook wrap"><p className="eyebrow">Packs para estudiantes</p><h1>Cuatro packs para tu primer día de piso.</h1><p className="home-lead">Mira qué entra, cuánto cuesta y cuándo lo recoges.</p><div className="cta-row"><Link className="btn" href="/packs">Ver los 4 packs</Link><a className="btn secondary" href="#como-funciona">Cómo funciona</a></div></section>
    <section data-block="3" className="trust-row wrap" aria-label="Confianza"><p>Recogida en tienda · Gratis</p><p>Pago simulado, sin cargo</p><p>Precio de demostración · IVA incluido</p></section>
    <section data-block="4" className="home-block wrap" aria-labelledby="packs-heading"><h2 id="packs-heading">Packs para estudiantes</h2><div className="pack-grid">{packs.map(p => <article className="pack-card" key={p.slug}><PackPlate name={p.name} units={p.units} price={eur(p.priceCents)} size="small"/><div className="pack-card-body"><h3>{p.name}</h3><p className="item-count">{p.units} artículos</p><p className="price">{eur(p.priceCents)}</p><span className="availability" data-availability={p.availability}>{availabilityLabel(p.availability)}</span><p className="micro">{PRICE_LABEL[p.dataStatus]}</p></div></article>)}</div></section>
    <section data-block="5" className="home-block wrap" aria-labelledby="contents-heading"><h2 id="contents-heading">Qué entra</h2><div className="contents-grid">{packs.map(pack => <article className="data-panel" key={pack.slug}><h3>{pack.name}</h3><ul>{pack.groups.flatMap(group => group.items).map(item => <li key={`${pack.slug}-${item.item}`}>{item.item} ×{item.qty}</li>)}</ul></article>)}</div></section>
    <section data-block="6" className="home-block wrap" aria-labelledby="coverage-heading"><h2 id="coverage-heading">Qué cubre cada pack</h2><div className="comparison-grid">{packs.map(pack => <article className="data-panel" key={pack.slug}><h3>{pack.name}</h3><p className="item-count">{pack.units} artículos</p><p>{pack.groups.length} grupos</p><p className="price">{eur(pack.priceCents)}</p><p>{pack.notIncluded.join(' · ')}</p></article>)}</div></section>
    <section data-block="7" id="como-funciona" className="home-block wrap" aria-labelledby="how-heading"><h2 id="how-heading">Cómo funciona</h2><ol className="steps"><li><strong>1</strong>{/* PENDIENTE @marketing */}</li><li><strong>2</strong>{/* PENDIENTE @marketing */}</li><li><strong>3</strong>{/* PENDIENTE @marketing */}</li></ol></section>
    <section data-block="8" className="home-block wrap" aria-labelledby="pickup-heading"><h2 id="pickup-heading">Dónde lo recoges</h2><div className="data-panel"><p>Recogida en tienda. Sin envíos.</p></div></section>
    <section data-block="9" className="home-block wrap" aria-labelledby="questions-heading"><h2 id="questions-heading">Dudas antes de comprar</h2><div className="faq-list">{[1, 2, 3, 4].map(number => <details key={number}><summary>{/* PENDIENTE @marketing */}</summary>{/* PENDIENTE @marketing */}</details>)}</div></section>
    <section data-block="10" className="home-block closure wrap"><p>Vas a ver todo lo que entra antes de pagar.</p><Link className="btn" href="/packs">Ver los 4 packs</Link></section>
  </main>;
}
