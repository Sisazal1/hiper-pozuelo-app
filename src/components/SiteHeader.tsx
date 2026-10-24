import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="header">
      <div className="wrap nav">
        <Link className="brand" href="/">Hiper Pozuelo</Link>
        <nav className="navlinks" aria-label="Principal">
          <Link href="/packs">Packs</Link>
          <Link href="/como-funciona">Cómo funciona</Link>
          <Link href="/recogida">Recogida</Link>
          <Link href="/faq">Preguntas</Link>
          <Link href="/carrito" className="navcart">Carrito</Link>
        </nav>
      </div>
    </header>
  );
}
