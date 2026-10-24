export function HeaderSearch() {
  return <form className="header-search" action="/packs" method="get"><label className="sr-only" htmlFor="header-query">Buscar packs</label><input id="header-query" name="q" type="search" aria-label="Buscar packs"/><button type="submit" aria-label="Buscar packs">⌕</button></form>;
}
