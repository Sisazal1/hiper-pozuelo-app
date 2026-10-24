import {AFFILIATION_LINE} from '@/src/content/disclosure';

export function SiteDisclosureBand({lang = 'es'}: {lang?: 'es' | 'en'}) {
  const text = lang === 'en' ? 'Academic demonstration. We are not the store.' : AFFILIATION_LINE.none;
  return <section data-block="0" className="site-disclosure-band" role="region" aria-label={text}>{text}</section>;
}
