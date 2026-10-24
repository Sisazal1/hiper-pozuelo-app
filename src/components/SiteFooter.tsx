import Link from 'next/link';
import {packs} from '@/src/content/packs';
import {AFFILIATION_LINE} from '@/src/content/disclosure';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-column"><h2>Packs para estudiantes</h2>{packs.map(p => <Link key={p.slug} href={`/packs/${p.slug}`}>{p.name}</Link>)}</div>
        <div className="footer-column"><h2>Dónde lo recoges</h2><p>Recogida en tienda. Sin envíos.</p></div>
        <div className="footer-column"><h2>Dudas antes de comprar</h2><p>Pago simulado, sin cargo</p></div>
        <div className="footer-column"><h2>Tu derecho a devolverlo</h2><p>14 días desde la recogida.</p></div>
      </div>
      <div className="wrap footer-disclosure">{AFFILIATION_LINE.none}</div>
    </footer>
  );
}
