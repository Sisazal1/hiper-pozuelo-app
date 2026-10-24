import type {Metadata} from 'next';
import Link from 'next/link';
import {PICKUP_ADDRESS_PENDING} from '@/src/content/store';

export const metadata: Metadata = {title: 'Recogida en tienda', description: 'Cómo y cuándo recoger tu pack en tienda.', alternates: {canonical: '/recogida'}};

export default function Pickup() {
  return (
    <main className="main wrap">
      <div className="eyebrow">Recogida</div>
      <h1 className="h1 page-h1">Recoges en tienda, en una sola visita</h1>
      <p className="lead">No hay envío. El pack se prepara antes de que llegues y se entrega en el mostrador con un código.</p>

      <div className="twocol">
        <section className="panel">
          <h2 className="h2">Dónde</h2>
          <p>{PICKUP_ADDRESS_PENDING}</p>
          <p className="muted">La dirección exacta se confirma al preparar tu pedido: preferimos no publicar una dirección que no sea la definitiva.</p>
          <h2 className="h2">Cuándo</h2>
          <p>Eliges franja al pagar. Las franjas se liberan si no se usan: una reserva caduca a los 10 minutos y el pedido no pagado no bloquea el hueco de otra persona.</p>
        </section>
        <section className="panel">
          <h2 className="h2">Qué llevas</h2>
          <ul className="checklist">
            <li>Tu pase, en el móvil o impreso</li>
            <li>O solo el código de 6 caracteres</li>
            <li>No hace falta DNI en esta demostración</li>
          </ul>
          <h2 className="h2">Si no puedes ir</h2>
          <p>El pedido caduca y los artículos vuelven al stock. Vuelve a comprar cuando puedas: no se cobra nada por una recogida no realizada en esta demostración.</p>
        </section>
      </div>

      <p className="cta-row"><Link className="btn" href="/packs">Ver los 4 packs</Link><Link className="btn secondary" href="/faq">Más preguntas</Link></p>
    </main>
  );
}
