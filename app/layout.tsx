import type {Metadata} from 'next';
import {AFFILIATION_LINE, FRAME_LEAD} from '@/src/content/disclosure';
import {SessionSource} from '@/src/components/SessionSource';
import {SiteHeader} from '@/src/components/SiteHeader';
import {SiteFooter} from '@/src/components/SiteFooter';
import './globals.css';

export const metadata: Metadata = {
  title: {default: 'Packs para estudiantes · Hiper Pozuelo', template: '%s · Hiper Pozuelo'},
  description: `${FRAME_LEAD} Packs de demostración para tu nueva vida en Madrid.`,
};

export default function Layout({children}: {children: React.ReactNode}) {
  return (
    <html lang="es">
      <body>
        <SessionSource/>
        <div className="band" role="region" aria-label="Aviso de demostración académica">{AFFILIATION_LINE.none}</div>
        <SiteHeader/>
        {children}
        <SiteFooter/>
      </body>
    </html>
  );
}
