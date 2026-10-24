import type {Metadata} from 'next';
import Link from 'next/link';
import {PICKUP_ADDRESS_PENDING} from '@/src/content/store';

export const metadata: Metadata = {title: 'Preguntas frecuentes', description: 'Resuelve tus dudas sobre packs, pago, recogida y devoluciones.', alternates: {canonical: '/faq'}};

const QA: {q: string; a: string}[] = [
  {q: '¿Cuánto tarda la recogida?', a: 'Preparamos el pack el mismo día. Al pagar eliges una franja de recogida y el pase te dice cuándo ir. Si no puedes acudir, el pedido caduca y los artículos vuelven a estar disponibles.'},
  {q: '¿Puedo pagar con tarjeta de verdad?', a: 'En esta demostración no. El pago es simulado: no se realiza ningún cargo y no hay campo de tarjeta en ningún momento. El flujo, los estados y los errores son los de una tienda real.'},
  {q: '¿Hay envío a domicilio?', a: 'No. El servicio es solo de recogida en tienda, en Pozuelo de Alarcón. Se decidió así porque el valor está en que todo esté junto y listo cuando llegas.'},
  {q: '¿Qué pasa si un artículo no me sirve?', a: 'Tienes 14 días de derecho de desistimiento desde que recoges, en los términos de las condiciones de compra. Escríbenos y te decimos cómo devolverlo.'},
  {q: '¿Puedo cambiar la hora de recogida?', a: 'Sí, antes de pagar: vuelve al selector de franja y elige otra. Después del pago, el pase queda fijado a esa hora.'},
  {q: '¿Puedo comprar dos packs a la vez?', a: 'Sí. El carrito admite varios packs y calcula el total. Un pedido, un pase, una recogida.'},
  {q: '¿Necesito cuenta?', a: 'No. Se compra como invitado con nombre y teléfono, que se usan solo para preparar y entregar el pedido.'},
  {q: '¿Qué hago si pierdo el pase?', a: 'El pase es un enlace: si lo guardaste, ábrelo otra vez. Si no, en el mostrador basta con el código de 6 caracteres, que también va impreso en el pase.'},
  {q: '¿Cómo os contacto?', a: 'El canal de contacto directo está pendiente de definir en esta demostración. Cualquier duda sobre el contenido de los packs está detallada en cada ficha.'},
];

export default function Faq() {
  return (
    <main className="main wrap">
      <div className="eyebrow">Ayuda</div>
      <h1 className="h1 page-h1">Preguntas frecuentes</h1>
      <p className="lead">Lo que la gente pregunta antes de comprar. Si falta algo, dilo y lo añadimos.</p>

      <div className="faq">
        {QA.map(({q, a}) => (
          <details key={q} className="faqitem">
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </div>

      <section className="panel">
        <h2 className="h2">Recogida</h2>
        <p>{PICKUP_ADDRESS_PENDING}</p>
        <p className="muted">Horario de recogida: se confirma al preparar el pedido.</p>
        <p><Link href="/recogida">Ver todo sobre la recogida</Link></p>
      </section>
    </main>
  );
}
