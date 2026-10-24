import type {Metadata} from 'next';
import Link from 'next/link';
import {packs} from '@/src/content/packs';
import {eur} from '@/src/lib/format';
import {PRICE_LABEL} from '@/src/content/price';
import {availabilityLabel} from '@/src/content/availability';
import {PROVENANCE_NOTE} from '@/src/content/disclosure';
import {PackCover} from '@/src/components/PackCover';

export const metadata: Metadata = {title: 'Los 4 packs'};

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

export default async function Packs({searchParams}: {searchParams: Promise<SP>}) {
  const sp = await searchParams;
  const q = one(sp.q).trim().toLowerCase();
  const orden = one(sp.orden) || 'recomendado';

  let list = packs.filter(p => {
    if (!q) return true;
    const hay = [p.name, p.benefit, ...p.groups.flatMap(g => g.items.map(i => i.item))].join(' ').toLowerCase();
    return hay.includes(q);
  });
  if (orden === 'precio-asc') list = [...list].sort((a, b) => a.priceCents - b.priceCents);
  if (orden === 'precio-desc') list = [...list].sort((a, b) => b.priceCents - a.priceCents);
  if (orden === 'articulos') list = [...list].sort((a, b) => b.units - a.units);

  return (
    <main className="main wrap">
      <div className="eyebrow">Catálogo</div>
      <h1 className="h1 page-h1">Los 4 packs</h1>
      <p className="lead">Todo lo que entra en cada pack, con precio final e IVA incluido.</p>

      <form className="filters" action="/packs" method="get">
        <label className="filters-q">
          <span className="label">Buscar</span>
          <input type="search" name="q" defaultValue={q} placeholder="toalla, sartén, sábanas…" />
        </label>
        <label>
          <span className="label">Ordenar</span>
          <select name="orden" defaultValue={orden}>
            <option value="recomendado">Recomendado</option>
            <option value="precio-asc">Precio: de menor a mayor</option>
            <option value="precio-desc">Precio: de mayor a menor</option>
            <option value="articulos">Más artículos</option>
          </select>
        </label>
        <button className="btn" type="submit">Aplicar</button>
      </form>

      <p className="muted results">{list.length} {list.length === 1 ? 'pack' : 'packs'}{q ? ` para “${q}”` : ''}</p>

      {list.length === 0 ? (
        <div className="panel">
          <h2 className="h2">Ningún pack contiene eso</h2>
          <p>Prueba con otra palabra o mira los cuatro packs completos.</p>
          <p className="cta-row"><Link className="btn secondary" href="/packs">Ver todos</Link></p>
        </div>
      ) : (
        <div className="grid">
          {list.map(p => (
            <article className="card packcard" key={p.slug}>
              <PackCover name={p.name} units={p.units} />
              <div className="cardbody">
                <h2>{p.name}</h2>
                <p className="muted">{p.benefit}</p>
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
      )}
    </main>
  );
}
