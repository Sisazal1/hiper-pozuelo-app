'use client';
import Link from 'next/link';
import {useEffect} from 'react';
import {withLang, type Lang} from '@/src/content/lang';
export function LanguageLinks({lang}: {lang: Lang}) { useEffect(() => { localStorage.setItem('lang', lang); }, [lang]); return <nav aria-label="Idioma" className="language-links" title={lang === 'es' ? undefined : 'English available on the home page only'}><Link href={withLang('/', 'es')} aria-current={lang === 'es' ? 'page' : undefined}>ES</Link><Link href={withLang('/', 'en')} aria-current={lang === 'en' ? 'page' : undefined}>EN</Link></nav>; }
