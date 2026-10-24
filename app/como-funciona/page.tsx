import type {Metadata} from 'next';
import Link from 'next/link';

export const metadata: Metadata = {title: 'Cómo funciona'};

const STEPS = [
  {n: '01', t: 'Elige tu pack', d: 'Cuatro packs: baño, cocina, habitación y el completo con los tres. Cada uno con la lista exacta de lo que entra y lo que no.'},
  {n: '02', t: 'Paga online', d: 'Pago con tarjeta en un entorno de demostración: no se realiza ningún cargo real. El pedido reserva tu franja durante 10 minutos mientras pagas.'},
  {n: '03', t: 'Recoge en tienda', d: 'Recibes un pase con un código de 6 caracteres. Lo enseñas en el mostrador y te llevas el pack completo en una sola visita.'},
];

export default function HowItWorks() {
  return (
    <main className="main wrap">
      <div className="eyebrow">Cómo funciona</div>
      <h1 className="h1 page-h1">Tres pasos, una visita a la tienda</h1>
      <p className="lead">Está pensado para quien acaba de llegar: nada que montar, nada que buscar por cuatro tiendas distintas.</p>

      <ol className="steps">
        {STEPS.map(s => (
          <li key={s.n} className="step">
            <span className="step-n">{s.n}</span>
            <h2 className="step-t">{s.t}</h2>
            <p>{s.d}</p>
          </li>
        ))}
      </ol>

      <section className="panel">
        <h2 className="h2">Qué incluye el servicio</h2>
        <ul className="checklist">
          <li>Precio final con IVA incluido. Sin extras ni cargos al pagar.</li>
          <li>Recogida en tienda en Pozuelo: no hay envío a domicilio.</li>
          <li>14 días de derecho de desistimiento sobre lo que compras.</li>
          <li>Cambio de hora de recogida antes de pagar.</li>
          <li>Un pase por pedido, válido una sola vez.</li>
        </ul>
      </section>

      <section className="panel">
        <h2 className="h2">Qué no incluye</h2>
        <ul className="checklist muted">
          <li>No hay entrega a domicilio.</li>
          <li>No hay cuenta de usuario: se compra como invitado.</li>
          <li>No hay suscripciones ni reposiciones automáticas.</li>
          <li>No hay valoraciones de clientes: no inventamos opiniones.</li>
        </ul>
      </section>

      <p className="cta-row"><Link className="btn" href="/packs">Ver los 4 packs</Link><Link className="btn secondary" href="/faq">Preguntas frecuentes</Link></p>
    </main>
  );
}
