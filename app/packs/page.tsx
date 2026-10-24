import type {Metadata} from 'next';
import Link from 'next/link';
import {packs} from '@/src/content/packs';
import {FilterChip} from '@/src/components/FilterChip';
import {SortSelect} from '@/src/components/SortSelect';
import {ResultsCount} from '@/src/components/ResultsCount';
import {PackCard} from '@/src/components/PackCard';

export const metadata: Metadata = {title: 'Los 4 packs'};
type SP = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? '';
const coverLabels = [{value: 'bano', label: 'Baño'}, {value: 'cocina', label: 'Cocina'}, {value: 'habitacion', label: 'Habitación'}];
const priceLabels = [{value: 'menos40', label: 'Menos de 40 €'}, {value: '40a80', label: '40–80 €'}, {value: 'mas80', label: 'Más de 80 €'}];
const sortOptions = [{value: 'recomendado', label: 'Recomendado'}, {value: 'precio-asc', label: 'Precio: de menor a mayor'}, {value: 'precio-desc', label: 'Precio: de mayor a menor'}, {value: 'articulos', label: 'Más artículos'}];

function queryHref(values: {q?: string; cubre?: string; precio?: string; orden?: string}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) if (value) query.set(key, value);
  return `/packs${query.toString() ? `?${query}` : ''}`;
}

export default async function Packs({searchParams}: {searchParams: Promise<SP>}) {
  const sp = await searchParams;
  const q = one(sp.q).trim().toLowerCase();
  const cubre = one(sp.cubre);
  const precio = one(sp.precio);
  const orden = one(sp.orden) || 'recomendado';
  let list = packs.filter(p => {
    const hay = [p.name, p.benefit, ...p.groups.flatMap(g => g.items.map(i => i.item))].join(' ').toLowerCase();
    const matchesCover = !cubre || (cubre === 'bano' && ['bano', 'completo'].includes(p.slug)) || (cubre === 'cocina' && ['cocina', 'completo'].includes(p.slug)) || (cubre === 'habitacion' && ['habitacion', 'completo'].includes(p.slug));
    const matchesPrice = !precio || (precio === 'menos40' && p.priceCents < 4000) || (precio === '40a80' && p.priceCents >= 4000 && p.priceCents <= 8000) || (precio === 'mas80' && p.priceCents > 8000);
    return (!q || hay.includes(q)) && matchesCover && matchesPrice;
  });
  if (orden === 'precio-asc') list = [...list].sort((a, b) => a.priceCents - b.priceCents);
  if (orden === 'precio-desc') list = [...list].sort((a, b) => b.priceCents - a.priceCents);
  if (orden === 'articulos') list = [...list].sort((a, b) => b.units - a.units);
  const base = {q: q || undefined, cubre: cubre || undefined, precio: precio || undefined, orden: orden !== 'recomendado' ? orden : undefined};
  const toggle = (key: 'cubre' | 'precio', value: string) => queryHref({...base, [key]: base[key] === value ? undefined : value});

  return <main className="catalog-page wrap"><div className="eyebrow">Packs para estudiantes</div><h1 className="h1 page-h1">Los 4 packs</h1><p className="lead">Todo lo que entra en cada pack, con precio final e IVA incluido.</p>
    <form className="catalog-controls" action="/packs" method="get"><label className="catalog-search"><span>Buscar</span><input type="search" name="q" defaultValue={q} placeholder="toalla, sartén, sábanas…"/></label>{cubre ? <input type="hidden" name="cubre" value={cubre}/> : null}{precio ? <input type="hidden" name="precio" value={precio}/> : null}<SortSelect value={orden} options={sortOptions}/><button className="btn" type="submit">Aplicar</button></form>
    <div className="facet-groups"><div><span className="facet-label">Qué cubre</span>{coverLabels.map(option => <FilterChip key={option.value} label={option.label} active={cubre === option.value} count={packs.filter(p => option.value === 'bano' ? ['bano', 'completo'].includes(p.slug) : option.value === 'cocina' ? ['cocina', 'completo'].includes(p.slug) : ['habitacion', 'completo'].includes(p.slug)).length} href={toggle('cubre', option.value)}/>)}</div><div><span className="facet-label">Precio</span>{priceLabels.map(option => <FilterChip key={option.value} label={option.label} active={precio === option.value} href={toggle('precio', option.value)}/>)}</div>{q || cubre || precio || orden !== 'recomendado' ? <Link className="clear-filters" href="/packs">Limpiar</Link> : null}</div>
    <ResultsCount count={list.length} q={q}/>{list.length === 0 ? <div className="panel empty-state"><h2 className="h2">Ningún pack contiene eso</h2><p>Prueba con otra palabra o mira los cuatro packs completos.</p><Link className="btn secondary" href="/packs">Ver todos</Link></div> : <div className="catalog-list">{list.map(p => <PackCard key={p.slug} p={p}/>)}</div>}
  </main>;
}
