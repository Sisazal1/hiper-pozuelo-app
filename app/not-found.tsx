import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="main wrap">
      <div className="eyebrow">Error 404</div>
      <h1 className="h1 page-h1">Esta página no existe</h1>
      <p className="lead">Puede que el enlace esté mal o que el pack ya no esté disponible.</p>
      <p className="cta-row"><Link className="btn" href="/packs">Ver los packs</Link><Link className="btn secondary" href="/">Ir al inicio</Link></p>
    </main>
  );
}
