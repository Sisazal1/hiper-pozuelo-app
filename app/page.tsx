import Link from 'next/link';
import {packs} from '@/src/content/packs';
import {eur} from '@/src/lib/format';
import {availabilityLabel} from '@/src/content/availability';
import {PRICE_LABEL} from '@/src/content/price';
import {PackPlate} from '@/src/components/PackPlate';

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

export default function Home() {
  return <main className="site-home">
    <section data-block="2" className="home-block hook wrap">
      <div className="hook-copy">
        <p className="eyebrow">Packs para estudiantes</p>
        <h1>Cuatro packs para tu primer día de piso.</h1>
        <p className="home-lead">Mira qué entra, cuánto cuesta y cuándo lo recoges.</p>
        <div className="cta-row">
          <Link className="btn" href="/packs">Ver los 4 packs</Link>
          <a className="btn secondary" href="#como-funciona">Cómo funciona</a>
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

    <section data-block="3" className="trust-row wrap" aria-label="Confianza">
      <p>Recogida en tienda · Gratis</p>
      <p>Pago simulado, sin cargo</p>
      <p>Precio de demostración · IVA incluido</p>
    </section>

    <section data-block="4" className="home-block wrap" aria-labelledby="packs-heading">
      <h2 id="packs-heading">Packs para estudiantes</h2>
      <div className="pack-grid">
        {packs.map(p => (
          <article className="pack-card" key={p.slug}>
            <PackPlate units={p.units}/>
            <div className="pack-card-body">
              <h3>{p.name}</h3>
              <p className="price">{eur(p.priceCents)}</p>
              <span className="availability" data-availability={p.availability}>{availabilityLabel(p.availability)}</span>
              <p className="micro">{PRICE_LABEL[p.dataStatus]}</p>
              <Link className="btn secondary pack-cta" href={`/packs/${p.slug}`}>Ver pack</Link>
            </div>
          </article>
        ))}
      </div>
    </section>

    <section data-block="5" className="home-block wrap" aria-labelledby="contents-heading">
      <h2 id="contents-heading">Qué entra</h2>
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
      <h2 id="coverage-heading">Qué cubre cada pack</h2>
      <div className="compare-scroll">
        <table className="compare">
          <caption className="sr-only">Comparación de los cuatro packs por artículos, grupos, precio y packs que no incluye</caption>
          <thead>
            <tr>
              <th scope="col">Pack</th>
              <th scope="col">Artículos</th>
              <th scope="col">Grupos</th>
              <th scope="col">Precio</th>
              <th scope="col">No incluye</th>
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
        {STEPS.map(step => (
          <li key={step.n}>
            <strong>{step.n}</strong>
            <h3>{step.title}</h3>
            <p>{step.line}</p>
          </li>
        ))}
      </ol>
    </section>

    <section data-block="8" className="home-block wrap" aria-labelledby="pickup-heading">
      <h2 id="pickup-heading">Dónde lo recoges</h2>
      <div className="data-panel pickup-panel">
        <p><strong>Recogida en tienda. Sin envíos.</strong></p>
        <p>Eliges día y hora al pagar.</p>
        <p>Con el código de 6 caracteres del pase.</p>
      </div>
    </section>

    <section data-block="9" className="home-block wrap" aria-labelledby="questions-heading">
      <h2 id="questions-heading">Dudas antes de comprar</h2>
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
      <p>Elige tu pack: verás todo lo que entra antes de pagar.</p>
      <Link className="btn" href="/packs">Ver los 4 packs</Link>
    </section>
  </main>;
}
