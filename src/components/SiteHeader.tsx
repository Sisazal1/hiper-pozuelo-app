import Link from 'next/link';
import {packs} from '@/src/content/packs';
import {HeaderSearch} from '@/src/components/HeaderSearch';
import {CartBadge} from '@/src/components/CartBadge';
import {LanguageLinks} from '@/src/components/LanguageLinks';

export function SiteHeader({lang = 'es'}: {lang?: 'es' | 'en'}) {
  return (
    <header data-block="1" className="site-header">
      <div className="wrap site-header-inner">
        <Link className="brand" href="/">Hiper Pozuelo</Link>
        <nav className="pack-nav" aria-label="Packs">
          {packs.map(pack => <Link key={pack.slug} href={`/packs/${pack.slug}`}>{pack.name}</Link>)}
        </nav>
        <div className="header-actions"><HeaderSearch lang={lang}/><Link className="cart-link" href="/carrito">{lang === 'en' ? 'Cart' : 'Carrito'} <CartBadge/></Link><LanguageLinks lang={lang}/></div>
      </div>
    </header>
  );
}
