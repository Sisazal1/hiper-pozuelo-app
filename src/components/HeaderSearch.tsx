export function HeaderSearch({lang = 'es'}: {lang?: 'es' | 'en'}) {
  const label = lang === 'en' ? 'Search packs' : 'Buscar packs';
  return <form className="header-search" action="/packs" method="get"><label className="sr-only" htmlFor="header-query">{label}</label><input id="header-query" name="q" type="search" placeholder={label} aria-label={label}/><button type="submit" aria-label={label}>⌕</button></form>;
}
