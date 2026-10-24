import Link from 'next/link';
import {packs} from '@/src/content/packs';
import {AFFILIATION_LINE} from '@/src/content/disclosure';
import {LanguageLinks} from '@/src/components/LanguageLinks';

export function SiteFooter({lang = 'es'}: {lang?: 'es' | 'en'}) {
  const en = lang === 'en';
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-column"><h2>{en ? 'Packs for students' : 'Packs para estudiantes'}</h2>{packs.map(p => <Link key={p.slug} href={`/packs/${p.slug}`}>{p.name}</Link>)}</div>
        <div className="footer-column"><h2>{en ? 'Where to collect it' : 'Dónde lo recoges'}</h2><p>{en ? 'Store collection. No delivery.' : 'Recogida en tienda. Sin envíos.'}</p></div>
        <div className="footer-column"><h2>{en ? 'Questions before buying' : 'Dudas antes de comprar'}</h2><p>{en ? 'Simulated payment, no charge' : 'Pago simulado, sin cargo'}</p></div>
        <div className="footer-column"><h2>{en ? 'Your right to return' : 'Tu derecho a devolverlo'}</h2><p>{en ? '14 days from collection.' : '14 días desde la recogida.'}</p></div>
      </div>
      <div className="wrap footer-disclosure">{en ? 'Academic demonstration. We are not the store.' : AFFILIATION_LINE.none}<LanguageLinks lang={lang}/></div>
    </footer>
  );
}
