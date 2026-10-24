import Link from 'next/link';
import {packs} from '@/src/content/packs';
import {eur} from '@/src/lib/format';
import {availabilityLabel} from '@/src/content/availability';
import {PRICE_LABEL} from '@/src/content/price';
import {PackPlate} from '@/src/components/PackPlate';
import {JsonLd} from '@/src/components/JsonLd';
import {SITE_URL} from '@/src/content/site';
import type {Metadata} from 'next';
import {copyFor, type Lang} from '@/src/content/lang';

export const metadata: Metadata = {title: 'Packs para estudiantes', description: 'Cuatro packs para tu primer día de piso.', alternates: {canonical: '/'}};

const STEPS = [
  {n: 1, title: 'Elige tu pack', line: 'Tienes cuatro: baño, cocina, habitación y completo.'},
  {n: 2, title: 'Paga una vez', line: 'Precio con IVA incluido, sin coste añadido. En la demo el pago es simulado.'},
  {n: 3, title: 'Recoge con un código', line: 'Te damos un código de 6 caracteres. Con eso basta en el mostrador.'},
];

const QUESTIONS = [
  {
    q: '¿Enviáis a casa o solo se recoge?',
    a: 'No. Solo se recoge en tienda, en la franja que elijas. No hay envío.',
  },
  {
    q: '¿Cuánto tarda la recogida?',
    a: 'Eliges día y hora al pagar y lo preparamos antes de que llegues. No hay espera de reparto.',
  },
  {
    q: '¿Puedo devolverlo?',
    a: 'Sí, tienes 14 días desde la recogida. Las condiciones están en Condiciones de compra.',
  },
  {
    q: '¿Y si no puedo ir a recogerlo?',
    a: 'Puede venir otra persona con tu código. Si se te pasa la franja, el pedido caduca y los artículos vuelven a estar disponibles.',
  },
];


// "No incluye" a nivel de pack, derivado de lo que el propio pack declara excluir:
// si un ítem excluido pertenece a otro pack, ese pack no entra.
function excludedPacks(pack: typeof packs[number]) {
  const names = packs
    .filter(other => other.slug !== pack.slug && other.groups.some(g => g.items.some(i => pack.notIncluded.includes(i.item))))
    .map(other => other.name);
  return names.length ? names.join(', ') : '—';
}

export default function Home({searchParams}: {searchParams?: Promise<{lang?: string}>}) {
  return searchParams ? <HomeWithLang searchParams={searchParams}/> : <HomeWithLang/>;
}
async function HomeWithLang({searchParams}: {searchParams?: Promise<{lang?: string}>}) {
  const lang = (await searchParams)?.lang === 'en' ? 'en' : 'es';
  const c = copyFor(lang as Lang);
  const steps = c.steps.map((step, i) => ({n: i + 1, ...step}));
  return <><JsonLd data={{'@context': 'https://schema.org', '@type': 'Organization', name: 'Hiper Pozuelo', url: SITE_URL, areaServed: 'Pozuelo de Alarcón'}}/><main className="site-home">
    <section data-block="2" className="home-block hook wrap">
      <div className="hook-copy">
        <p className="eyebrow">{c.packs}</p>
        <h1>{c.homeTitle}</h1>
        <p className="home-lead">{c.homeLead}</p>
        <div className="cta-row">
          <Link className="btn" href="/packs">{c.viewPacks}</Link>
          <a className="btn secondary" href="#como-funciona">{c.how}</a>
        </div>
      </div>
      <ul className="hook-index" aria-label="Los cuatro packs y su precio">
        {packs.map(p => (
          <li key={p.slug}>
            <Link href={`/packs/${p.slug}`}>
              <span>{p.name}</span>
              <span className="hi-price">{eur(p.priceCents)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>

    <section data-block="3" className="trust-row wrap" aria-label={c.packs}>
      <p>{c.pickup}</p><p>{c.simulated}</p><p>{c.demoPrice}</p>
    </section>

    <section data-block="4" className="home-block wrap" aria-labelledby="packs-heading">
      <h2 id="packs-heading">{c.packs}</h2>
      <div className="pack-grid">
        {packs.map(p => (
          <article className="pack-card" key={p.slug}>
            <PackPlate units={p.units}/>
            <div className="pack-card-body">
              <h3>{p.name}</h3>
              <p className="price">{eur(p.priceCents)}</p>
              <span className="availability" data-availability={p.availability}>{c.availability[p.availability as keyof typeof c.availability]}</span>
              <p className="micro">{PRICE_LABEL[p.dataStatus]}</p>
              <Link className="btn secondary pack-cta" href={`/packs/${p.slug}`}>{c.viewPack}</Link>
            </div>
          </article>
        ))}
      </div>
    </section>

    <section data-block="5" className="home-block wrap" aria-labelledby="contents-heading">
      <h2 id="contents-heading">{c.contents}</h2>
      <div className="contents-grid">
        {packs.map(pack => (
          <article className="data-panel" key={pack.slug}>
            <h3>{pack.name}</h3>
            <ul>{pack.groups.flatMap(group => group.items).map(item => <li key={`${pack.slug}-${item.item}`}>{item.item} ×{item.qty}</li>)}</ul>
          </article>
        ))}
      </div>
    </section>

    <section data-block="6" className="home-block wrap" aria-labelledby="coverage-heading">
      <h2 id="coverage-heading">{c.coverage}</h2>
      <div className="compare-scroll">
        <table className="compare">
          <caption className="sr-only">Comparación de los cuatro packs por artículos, grupos, precio y packs que no incluye</caption>
          <thead>
            <tr>
              <th scope="col">{c.pack}</th><th scope="col">{c.items}</th><th scope="col">{c.groups}</th>
              <th scope="col">Precio</th>
              <th scope="col">{c.notIncluded}</th>
            </tr>
          </thead>
          <tbody>
            {packs.map(pack => (
              <tr key={pack.slug}>
                <th scope="row">{pack.name}</th>
                <td>{pack.units}</td>
                <td>{pack.groups.length}</td>
                <td className="price">{eur(pack.priceCents)}</td>
                <td className="compare-excluded">{excludedPacks(pack)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>

    <section data-block="7" id="como-funciona" className="home-block wrap" aria-labelledby="how-heading">
      <h2 id="how-heading">Cómo funciona</h2>
      <ol className="steps">
        {steps.map(step => (
          <li key={step.n}>
            <strong>{step.n}</strong>
            <h3>{step.title}</h3>
            <p>{step.line}</p>
          </li>
        ))}
      </ol>
    </section>

    <section data-block="8" className="home-block wrap" aria-labelledby="pickup-heading">
      <h2 id="pickup-heading">{c.where}</h2>
      <div className="data-panel pickup-panel">
        <p><strong>{c.noShipping}</strong></p><p>{c.chooseTime}</p><p>{c.code}</p>
      </div>
    </section>

    <section data-block="9" className="home-block wrap" aria-labelledby="questions-heading">
      <h2 id="questions-heading">{c.questions}</h2>
      <div className="faq-list">
        {QUESTIONS.map(item => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>

    <section data-block="10" className="home-block closure wrap">
      <p>{c.close}</p><Link className="btn" href="/packs">{c.viewPacks}</Link>
    </section>
  </main></>;
}
