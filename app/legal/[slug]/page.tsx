import {notFound} from 'next/navigation';
import {CHECKOUT_COPY} from '@/src/content/checkout';
import {ANALYTICS_MEASUREMENT} from '@/src/content/disclosure';

// m-3 (D-063): the heading was the slug, so the page titled itself `aviso-legal` in lowercase.
const HEADINGS: Record<string, string> = {
  'aviso-legal': 'Aviso legal',
  privacidad: 'Privacidad',
  'condiciones-compra': 'Condiciones de compra',
  devoluciones: 'Devoluciones',
};
const slugs = Object.keys(HEADINGS);

export function generateStaticParams() {
  return slugs.map(slug => ({slug}));
}

export const metadata = {robots: {index: false, follow: false}};

export default async function Legal({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;
  if (!slugs.includes(slug)) notFound();
  return <main className="main wrap">
    <h1 className="h1">{HEADINGS[slug]}</h1>
    {slug === 'privacidad' && <section>
      <h2 className="h2">{CHECKOUT_COPY.measurementHeading}</h2>
      <p>{ANALYTICS_MEASUREMENT}</p>
    </section>}
    <p>{CHECKOUT_COPY.legalPlaceholder}</p>
    <p>Demostración académica. No somos la tienda.</p>
  </main>;
}
