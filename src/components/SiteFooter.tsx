import Link from 'next/link';
import {packs} from '@/src/content/packs';
import {eur} from '@/src/lib/format';
import {FOOTER_DISCLOSURE} from '@/src/content/disclosure';
import {PICKUP_ADDRESS_PENDING} from '@/src/content/store';

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap footgrid">
        <div>
          <div className="footbrand">Hiper Pozuelo</div>
          <p className="footnote">Packs de llegada para estudiantes Erasmus en Pozuelo de Alarcón.</p>
        </div>
        <div>
          <div className="foothead">Packs</div>
          <ul className="footlist">
            {packs.map(p => (
              <li key={p.slug}><Link href={`/packs/${p.slug}`}>{p.name} · {eur(p.priceCents)}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <div className="foothead">Ayuda</div>
          <ul className="footlist">
            <li><Link href="/como-funciona">Cómo funciona</Link></li>
            <li><Link href="/recogida">Recogida en tienda</Link></li>
            <li><Link href="/faq">Preguntas frecuentes</Link></li>
            <li><Link href="/carrito">Tu carrito</Link></li>
          </ul>
        </div>
        <div>
          <div className="foothead">Legal</div>
          <ul className="footlist">
            <li><Link href="/legal/condiciones-compra">Condiciones de compra</Link></li>
            <li><Link href="/legal/devoluciones">Devoluciones y desistimiento</Link></li>
            <li><Link href="/legal/privacidad">Privacidad</Link></li>
            <li><Link href="/legal/aviso-legal">Aviso legal</Link></li>
          </ul>
        </div>
      </div>
      <div className="wrap footbar">
        <span>{PICKUP_ADDRESS_PENDING}</span>
        <span>{FOOTER_DISCLOSURE}</span>
      </div>
    </footer>
  );
}
