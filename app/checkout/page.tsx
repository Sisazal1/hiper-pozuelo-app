'use client';
import {useEffect, useMemo, useState} from 'react';
import {eur} from '@/src/lib/format';
import {PRICE_LABEL} from '@/src/content/price';
import {CHECKOUT_COPY, PAY_CTA_A, REVIEW_CTA_A} from '@/src/content/checkout';
import {total, type CartLine} from '@/src/lib/cart';
import {sendEvent, sessionId} from '@/src/lib/session';

// B-1 (D-063): the step used to live only in React state, so F5 at step 2 read the cart back but
// not the order it had already created — and the server answered `existing:true` with no token.
// The token is now kept for the life of the tab (`sessionStorage`): it is the same secret the pass
// URL carries, never written to localStorage, never on the order row in clear, never joined to PII.
const TICKET_KEY = 'hiper-order-ticket';
type Ticket = {orderRef: string; token: string; paid: boolean};

function readTicket(): Ticket | null {
  try {
    const raw = sessionStorage.getItem(TICKET_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const {orderRef, token, paid} = parsed as Record<string, unknown>;
    if (typeof orderRef !== 'string' || typeof token !== 'string' || typeof paid !== 'boolean') return null;
    return {orderRef, token, paid};
  } catch {
    // A malformed entry is not an error the customer can act on: it is dropped and the step starts
    // over, which is exactly what an absent ticket does.
    sessionStorage.removeItem(TICKET_KEY);
    return null;
  }
}

function writeTicket(ticket: Ticket) {
  try {
    sessionStorage.setItem(TICKET_KEY, JSON.stringify(ticket));
  } catch {
    // Storage refused (private mode / quota): the order still exists and its link is on the pass.
    // Nothing is logged and nothing pretends to be saved.
  }
}

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [lines, setLines] = useState<CartLine[]>([]);
  const [orderRef, setOrderRef] = useState('');
  const [token, setToken] = useState('');
  const [paid, setPaid] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const amount = useMemo(() => total(lines), [lines]);

  useEffect(() => {
    const raw: unknown = JSON.parse(localStorage.getItem('cart') || '{}');
    if (raw && typeof raw === 'object') {
      setLines(Object.entries(raw as Record<string, unknown>).map(([slug, qty]) => ({slug, qty: Number(qty)})));
    }
    const ticket = readTicket();
    if (ticket) {
      setOrderRef(ticket.orderRef);
      setToken(ticket.token);
      setPaid(ticket.paid);
      setStep(ticket.paid ? 3 : 2);
      return;
    }
    void sendEvent('checkout_step_viewed', {step: 1});
  }, []);

  async function create() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({lines, name, phone, slotId: 'slot-1', session_id: sessionId()}),
      });
      const data: {orderRef?: string; token?: string | null; status?: string; error?: string} = await res.json();
      if (!res.ok || !data.orderRef) {
        setMessage(data.error ?? CHECKOUT_COPY.confirmUnconfirmed);
        return;
      }
      setOrderRef(data.orderRef);
      if (data.token) {
        setToken(data.token);
        setPaid(false);
        writeTicket({orderRef: data.orderRef, token: data.token, paid: false});
        setStep(2);
        void sendEvent('checkout_step_viewed', {step: 2});
        return;
      }
      // The order already exists and is not payable again (paid or collected). The tab's ticket is
      // the only thing that can still address its pass; without it the screen says so and offers a
      // route back instead of a dead end.
      const stored = readTicket();
      if (stored && stored.orderRef === data.orderRef) setToken(stored.token);
      setPaid(true);
      setStep(3);
      void sendEvent('checkout_step_viewed', {step: 3});
    } finally {
      setBusy(false);
    }
  }

  async function pay() {
    const res = await fetch('/api/pay', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({orderRef, token, session_id: sessionId()}),
    });
    const data: {status?: string; pickup_code?: string | null; error?: string} = await res.json();
    if (res.ok && data.status === 'paid') {
      setPaid(true);
      writeTicket({orderRef, token, paid: true});
      setStep(3);
      void sendEvent('checkout_step_viewed', {step: 3});
      return;
    }
    // R-049: the hold ran out, so the minutes are back in the window and this order cannot be paid.
    // The customer is sent to step 1 rather than left on a payment screen that will never succeed.
    if (data.error === CHECKOUT_COPY.holdExpired) {
      try { sessionStorage.removeItem(TICKET_KEY); } catch { /* nothing was stored */ }
      setToken('');
      setPaid(false);
      setStep(1);
      setMessage(CHECKOUT_COPY.holdExpired);
      return;
    }
    setMessage(data.error ?? CHECKOUT_COPY.paymentFailed);
    void sendEvent('payment_failed', {order_ref: orderRef});
  }

  function fail() {
    setMessage(CHECKOUT_COPY.paymentFailed);
    void sendEvent('payment_failed', {order_ref: orderRef});
  }

  return <main className="main wrap">
    <h1 className="h1">{CHECKOUT_COPY.pageTitle}</h1>
    <p className="formmsg" role="status" aria-live="polite">{message}</p>

    {step === 1 && <section className="cardbody">
      <h2 className="h2">Cuándo y quién</h2>
      <label className="field" htmlFor="f-name"><span>Nombre completo</span>
        <input id="f-name" name="name" type="text" autoComplete="name" required value={name} onChange={e => setName(e.target.value)} />
      </label>
      <label className="field" htmlFor="f-phone"><span>Teléfono</span>
        <input id="f-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required value={phone} onChange={e => setPhone(e.target.value)} />
      </label>
      <label className="field" htmlFor="f-slot"><span>Elige día y hora</span>
        <select id="f-slot" name="slot" defaultValue="sábado 10:00"><option>sábado 10:00</option></select>
      </label>
      <button className="btn" onClick={create} disabled={busy || lines.length === 0}>
        {/* m-6 (D-063): an empty cart has nothing to pay, so it does not advertise an amount. */}
        {lines.length === 0 ? 'Continuar al pago' : `Continuar al pago · ${eur(amount)}`}
      </button>
    </section>}

    {step === 2 && <section className="cardbody">
      <h2 className="h2">{CHECKOUT_COPY.paymentHeading}</h2>
      <p>{CHECKOUT_COPY.paymentLine}</p>
      <p className="price">{eur(amount)}</p>
      <span className="label">{PRICE_LABEL['ASSUMED-demo']}</span>
      {token
        ? <>
          <button className="btn" onClick={pay}>{`${PAY_CTA_A} · ${eur(amount)}`}</button>
          <button className="btn secondary" onClick={fail}>Simular pago fallido</button>
        </>
        : <>
          <p>{CHECKOUT_COPY.orderAlreadyPaid}</p>
          <a className="btn secondary" href="/carrito">Volver al carrito</a>
        </>}
    </section>}

    {step === 3 && <section className="cardbody">
      <h2 className="h2">Revisión</h2>
      <p>{CHECKOUT_COPY.pending}</p>
      {paid && <button className="btn" onClick={() => {setStep(4); void sendEvent('checkout_step_viewed', {step: 4});}}>
        {REVIEW_CTA_A} · {eur(amount)}
      </button>}
    </section>}

    {step === 4 && <section className="cardbody">
      <h2 className="h2">Pedido recibido</h2>
      {token
        ? <a className="btn" href={`/pedido/${token}`}>Ver pase</a>
        : <><p>{CHECKOUT_COPY.orderAlreadyPaid}</p><a className="btn secondary" href="/carrito">Volver al carrito</a></>}
    </section>}
  </main>;
}
