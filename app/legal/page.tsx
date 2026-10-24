import type {Metadata} from 'next';
import Link from 'next/link';

export const metadata: Metadata = {title: 'Información legal', description: 'Condiciones, devoluciones, privacidad y aviso legal.', alternates: {canonical: '/legal'}};

const DOCS = [
  {slug: 'condiciones-compra', title: 'Condiciones de compra', d: 'Qué compras, cómo se paga, cuándo y dónde se recoge, y qué pasa si algo falla.'},
  {slug: 'devoluciones', title: 'Devoluciones y desistimiento', d: 'Los 14 días de derecho de desistimiento, cómo se ejerce y qué se devuelve.'},
  {slug: 'privacidad', title: 'Privacidad', d: 'Qué datos se recogen (nombre y teléfono), para qué y durante cuánto tiempo.'},
  {slug: 'aviso-legal', title: 'Aviso legal', d: 'Titular del sitio, condiciones de uso y limitación de responsabilidad.'},
];

export default function LegalHub() {
  return (
    <main className="main wrap">
      <div className="eyebrow">Legal</div>
      <h1 className="h1 page-h1">Información legal</h1>
      <p className="lead">Cuatro documentos. Sin letra pequeña que contradiga lo que dice la tienda.</p>
      <ul className="doclist">
        {DOCS.map(d => (
          <li key={d.slug}>
            <Link href={`/legal/${d.slug}`}>
              <span className="doc-t">{d.title}</span>
              <span className="doc-d">{d.d}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="muted">Estos textos son de demostración académica y no constituyen asesoramiento jurídico.</p>
    </main>
  );
}
