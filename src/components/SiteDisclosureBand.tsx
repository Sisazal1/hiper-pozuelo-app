import {AFFILIATION_LINE} from '@/src/content/disclosure';

export function SiteDisclosureBand() {
  return <section data-block="0" className="site-disclosure-band" role="region" aria-label={AFFILIATION_LINE.none}>{AFFILIATION_LINE.none}</section>;
}
