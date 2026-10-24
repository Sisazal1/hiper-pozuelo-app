import Link from 'next/link';
import {packs} from '@/src/content/packs';
import {eur} from '@/src/lib/format';
import {PRICE_LABEL, TRUST_PRICE_A} from '@/src/content/price';
import {PROVENANCE_NOTE} from '@/src/content/disclosure';
import {availabilityLabel} from '@/src/content/availability';
import {PackCover} from '@/src/components/PackCover';

export default function Home(){
  const from = eur(Math.min(...packs.map(p => p.priceCents)));
  return (
    <main className="main wrap">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">Packs para estudiantes</div>
          <h1 className="h1">Todo lo que necesitas para tu nueva vida en Madrid</h1>
          <p className="hero-lead">Mira qué entra, cuánto cuesta y cuándo lo recoges.</p>
          <div className="hero-meta">
            <span>{packs.length} packs</span><span>desde {from}</span><span>recogida en tienda</span>
          </div>
          <Link className="btn" href="/packs">Ver los 4 packs</Link>
        </div>
        <ul className="hero-index">
          {packs.map(p => (
            <li key={p.slug}>
              <Link href={`/packs/${p.slug}`}>
                <span className="hi-name">{p.name}</span>
                <span className="hi-units">{p.units} artículos</span>
                <span className="hi-price">{eur(p.priceCents)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid promises">
        {['Recogida en tienda', 'Pago simulado, sin cargo', TRUST_PRICE_A].map(x => (
          <div className="cardbody tile" key={x}>{x}</div>
        ))}
      </div>

      <h2 className="h2">Packs para estudiantes</h2>
      <div className="grid">
        {packs.map(p => (
          <article className="card packcard" key={p.slug}>
            <PackCover name={p.name} units={p.units} />
            <div className="cardbody">
              <h3>{p.name}</h3>
              <ul className="peek">
                {p.groups[0]?.items.slice(0, 3).map(i => <li key={i.item}>{i.item}</li>)}
                <li className="peek-more">y {Math.max(p.units - 3, 0)} más</li>
              </ul>
              <div className="price">{eur(p.priceCents)}</div>
              <span className="label">{PRICE_LABEL[p.dataStatus]}</span>
              <span className="availability" data-availability={p.availability}>{availabilityLabel(p.availability)}</span>
              <p className="label">{PROVENANCE_NOTE}</p>
              <Link className="btn secondary" href={`/packs/${p.slug}`}>Ver pack</Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
