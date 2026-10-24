'use client';
import {useState} from 'react';
import {CHECKOUT_COPY} from '@/src/content/checkout';
import {sessionId} from '@/src/lib/session';

type Loaded = {orderRef: string; status: string};

const STATUS_LABEL: Record<string, string> = {
  paid: 'Pagado · listo para entregar',
  collected: 'Ya recogido',
  refunded: 'Anulado · pago simulado, no se ha cobrado nada',
  pending: 'Pendiente de pago',
  expired: 'Reserva caducada',
  declined: 'Pago no completado',
};

export default function Counter() {
  const [code, setCode] = useState('');
  const [order, setOrder] = useState<Loaded | null>(null);
  const [message, setMessage] = useState('');

  function read(data: {status?: string; order_ref?: string; order?: Loaded; error?: string}) {
    if (data.order) {
      setOrder(data.order);
      setMessage(STATUS_LABEL[data.order.status] ?? data.order.status);
      return;
    }
    if (data.status && data.order_ref) setOrder({orderRef: data.order_ref, status: data.status});
    setMessage(data.status === 'already_collected' ? 'Ya recogido anteriormente.' : 'Pedido entregado.');
  }

  async function act(action: 'collect' | 'refund') {
    const body = action === 'refund'
      ? {action, orderRef: order?.orderRef ?? '', session_id: sessionId()}
      : {pickup_code: code, session_id: sessionId()};
    const res = await fetch('/api/mostrador', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify(body)});
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? CHECKOUT_COPY.codeMiss);
      return;
    }
    if (action === 'refund') {
      setOrder(order ? {...order, status: 'refunded'} : null);
      setMessage(STATUS_LABEL.refunded);
      return;
    }
    read(data);
  }

  async function lookup() {
    const res = await fetch('/api/mostrador', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({action: 'lookup', pickup_code: code})});
    const data = await res.json();
    if (!res.ok) {
      setOrder(null);
      setMessage(data.error ?? CHECKOUT_COPY.codeMiss);
      return;
    }
    read(data);
  }

  return <main className="main wrap">
    <h1 className="h1">Mostrador</h1>
    <label className="field" htmlFor="f-code"><span>Código de recogida</span>
      <input id="f-code" name="code" type="text" inputMode="text" autoComplete="one-time-code" maxLength={6}
        style={{textTransform: 'uppercase', letterSpacing: '.12em', fontWeight: 700}}
        value={code} onChange={e => setCode(e.target.value.toUpperCase())} />
    </label>
    <button className="btn" onClick={() => act('collect')} disabled={code.length !== 6}>{CHECKOUT_COPY.collect}</button>
    <button className="btn secondary" onClick={lookup} disabled={code.length !== 6}>Buscar pedido</button>
    {/* m-4 (D-063): the refund lived beside the code field and answered `Pedido no encontrado` on
        every press. It now exists only for the order that was actually loaded. */}
    {order && <section className="cardbody">
      <p>{order.orderRef} · {STATUS_LABEL[order.status] ?? order.status}</p>
      {order.status === 'paid' && <button className="btn secondary" onClick={() => act('refund')}>Anular pedido</button>}
    </section>}
    <p className="formmsg" role="status" aria-live="polite">{message}</p>
    <p>Demostración académica. No somos la tienda.</p>
  </main>;
}
