import type {Metadata} from 'next';
import {FRAME_LEAD} from '@/src/content/disclosure';
import {SessionSource} from '@/src/components/SessionSource';
import {SiteHeader} from '@/src/components/SiteHeader';
import {SiteFooter} from '@/src/components/SiteFooter';
import {SiteDisclosureBand} from '@/src/components/SiteDisclosureBand';
import {SITE_URL} from '@/src/content/site';
import {headers} from 'next/headers';
import {type Lang} from '@/src/content/lang';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {default: 'Packs para estudiantes · Hiper Pozuelo', template: '%s · Hiper Pozuelo'},
  description: `${FRAME_LEAD} Packs de demostración para tu nueva vida en Madrid.`,
};

export default async function Layout({children}: {children: React.ReactNode}) {
  const lang = ((await headers()).get('x-site-lang') === 'en' ? 'en' : 'es') as Lang;
  return (
    <html lang={lang} dir="ltr">
      <body>
        <SiteDisclosureBand lang={lang}/>
        <SessionSource/>
        <SiteHeader lang={lang}/>
        {children}
        <SiteFooter lang={lang}/>
      </body>
    </html>
  );
}
