import {copyEs, type Copy} from './copy';
import {copyEn} from './copy.en';
export type Lang = 'es' | 'en';
export function resolveLang(searchParams: URLSearchParams | {lang?: string} | undefined): Lang { return (searchParams instanceof URLSearchParams ? searchParams.get('lang') : searchParams?.lang) === 'en' ? 'en' : 'es'; }
export function copyFor(lang: Lang): Copy { return lang === 'en' ? copyEn : copyEs; }
export function withLang(href: string, lang: Lang) { const join = href.includes('?') ? '&' : '?'; return `${href}${join}lang=${lang}`; }
