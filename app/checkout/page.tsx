'use client';
import {useEffect, useMemo, useState} from 'react';
import {eur} from '@/src/lib/format';
import {PRICE_LABEL} from '@/src/content/price';
import {CHECKOUT_COPY, PAY_CTA_A, REVIEW_CTA_A} from '@/src/content/checkout';
import {total, type CartLine} from '@/src/lib/cart';
import {sendEvent, sessionId} from '@/src/lib/session';
import Alert from '@/src/components/Alert';

// B-1 (D-063): the step used to live only in React state, so F5 at step 2 read the cart back but
// not the order it had already created — and the server answered `existing:true` with no token.
// The token is now kept for the life of the tab (`sessionStorage`): it is the same secret the pass
// URL carries, never written to localStorage, never on the order row in clear, never joined to PII.
//
// D-065 §5(c): `totalCents` is part of the ticket because step 2 charges the ORDER, not the cart.
// With the amount read from cart state, editing the cart and pressing F5 offered 59,90 € for a
// 32,90 € order. A ticket without the field is treated as no ticket — falling back to the cart is
// the defect this field deletes.
const TICKET_KEY = 'hiper-order-ticket';
type Ticket = {orderRef: string; token: string; paid: boolean; totalCents: number};

function readTicket(): Ticket | null {
  try {
    const raw = sessionStorage.getItem(TICKET_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const {orderRef, token, paid, totalCents} = parsed as Record<string, unknown>;
    if (typeof orderRef !== 'string' || typeof token !== 'string' || typeof paid !== 'boolean') return null;
    if (typeof totalCents !== 'number' || !Number.isFinite(totalCents)) return null;
    return {orderRef, token, paid, totalCents};
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

// The three states the copy file writes words for. Each one is an `Alert` (§5.8), not a sentence
// above a button: an error says what did not happen and what to do next (D-065 §4–§5).
type AlertKind = 'payment' | 'hold' | 'duplicate';

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [lines, setLines] = useState<CartLine[]>([]);
  const [orderRef, setOrderRef] = useState('');
  const [token, setToken] = useState('');
  const [orderTotal, setOrderTotal] = useState<number | null>(null);
  const [paid, setPaid] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [alert, setAlert] = useState<AlertKind | null>(null);
  const cartTotal = useMemo(() => total(lines), [lines]);

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
      setOrderTotal(ticket.totalCents);
      setStep(ticket.paid ? 3 : 2);
      return;
    }
    void sendEvent('checkout_step_viewed', {step: 1});
  }, []);

  // D-065 §5(a): every step change and every submit clears the previous state's words. A failed
  // payment followed by a successful one used to reach step 3 with "El pago simulado no se ha
  // completado…" printed above the confirmation.
  function goToStep(next: number) {
    setMessage('');
    setAlert(null);
    setStep(next);
    void sendEvent('checkout_step_viewed', {step: next});
  }

  async function create() {
    if (busy) return;
    setBusy(true);
    setMessage('');
    setAlert(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({lines, name, phone, slotId: 'slot-1', session_id: sessionId()}),
      });
      const data: {orderRef?: string | null; token?: string | null; totalCents?: number; status?: string; duplicate?: boolean; error?: string} = await res.json();
      // D-065 §3: the same purchase is live under another tab. Nothing was created and nothing was
      // charged; name, phone and cart stay exactly as the customer left them, on this step.
      if (res.status === 409 && data.duplicate) {
        setAlert('duplicate');
        return;
      }
      if (!res.ok || !data.orderRef) {
        setMessage(data.error ?? CHECKOUT_COPY.confirmUnconfirmed);
        return;
      }
      setOrderRef(data.orderRef);
      setOrderTotal(typeof data.totalCents === 'number' ? data.totalCents : null);
      if (data.token && typeof data.totalCents === 'number') {
        setToken(data.token);
        setPaid(false);
        writeTicket({orderRef: data.orderRef, token: data.token, paid: false, totalCents: data.totalCents});
        goToStep(2);
        return;
      }
      // The order already exists and is not payable again (paid). This tab's ticket is the only
      // thing that can still address its pass; the confirmation offers the route, not a re-issue.
      const stored = readTicket();
      if (stored && stored.orderRef === data.orderRef) {
        setToken(stored.token);
        setOrderTotal(stored.totalCents);
      }
      setPaid(true);
      goToStep(3);
    } finally {
      setBusy(false);
    }
  }

  async function pay() {
    setMessage('');
    setAlert(null);
    const res = await fetch('/api/pay', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({orderRef, token, session_id: sessionId()}),
    });
    const data: {status?: string; pickup_code?: string | null; error?: string} = await res.json();
    if (res.ok && data.status === 'paid') {
      setPaid(true);
      if (orderTotal !== null) writeTicket({orderRef, token, paid: true, totalCents: orderTotal});
      goToStep(3);
      return;
    }
    // R-049 (r12): the hold ran out, so the minutes are back in the window and this order cannot be
    // paid. The customer is sent to step 1 with the three-line block — release, money, exit — rather
    // than left on a payment screen that will never succeed.
    if (data.error === CHECKOUT_COPY.holdExpired) {
      try { sessionStorage.removeItem(TICKET_KEY); } catch { /* nothing was stored */ }
      setToken('');
      setPaid(false);
      setOrderTotal(null);
      setStep(1);
      setAlert('hold');
      return;
    }
    setAlert('payment');
    void sendEvent('payment_failed', {order_ref: orderRef});
  }

  function fail() {
    setMessage('');
    setAlert('payment');
    void sendEvent('payment_failed', {order_ref: orderRef});
  }

  return <main className="main wrap">
    <h1 className="h1">{CHECKOUT_COPY.pageTitle}</h1>
    {/* Server refusals that are not a written state (capacity, datos, carrito vacío) keep the status
        line: it is announced, it is not an alert with an action because there is nothing to press. */}
    <p className="formmsg" role="status" aria-live="polite">{message}</p>

    {step === 1 && <section className="cardbody">
      {alert === 'duplicate' && <Alert
        variant="error"
        heading={CHECKOUT_COPY.duplicateHeading}
        body={CHECKOUT_COPY.duplicateBody}
        action={{label: CHECKOUT_COPY.duplicateActionPhone, onClick: () => document.getElementById('f-phone')?.focus()}}
        focusTarget="#f-phone"
      />}
      {alert === 'hold' && <Alert
        variant="error"
        heading={CHECKOUT_COPY.holdExpired}
        body={CHECKOUT_COPY.notCharged}
        action={{label: CHECKOUT_COPY.chooseSlot, onClick: () => document.getElementById('f-slot')?.focus()}}
      />}
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
        {/* m-6 (D-063): an empty cart has nothing to pay, so it does not advertise an amount.
            The cart total is the honest source on this step only — it becomes the order's on step 2. */}
        {lines.length === 0 ? 'Continuar al pago' : `Continuar al pago · ${eur(cartTotal)}`}
      </button>
    </section>}

    {step === 2 && orderTotal !== null && <section className="cardbody">
      <h2 className="h2">{CHECKOUT_COPY.paymentHeading}</h2>
      <p>{CHECKOUT_COPY.paymentLine}</p>
      <p className="price">{eur(orderTotal)}</p>
      <span className="label">{PRICE_LABEL['ASSUMED-demo']}</span>
      {alert === 'payment' && <Alert
        variant="error"
        heading={CHECKOUT_COPY.paymentFailedHeading}
        body={CHECKOUT_COPY.paymentFailed}
        action={{label: CHECKOUT_COPY.retry, onClick: () => void pay()}}
      />}
      <button className="btn" onClick={pay}>{`${PAY_CTA_A} · ${eur(orderTotal)}`}</button>
      <button className="btn secondary" onClick={fail}>Simular pago fallido</button>
    </section>}

    {step === 3 && <section className="cardbody">
      <h2 className="h2">Revisión</h2>
      <p>{CHECKOUT_COPY.pending}</p>
      {paid && orderTotal !== null && <button className="btn" onClick={() => goToStep(4)}>
        {REVIEW_CTA_A} · {eur(orderTotal)}
      </button>}
    </section>}

    {step === 4 && <section className="cardbody">
      <h2 className="h2">Pedido recibido</h2>
      {token
        ? <a className="btn" href={`/pedido/${token}`}>Ver pase</a>
        : <a className="btn secondary" href="/carrito">Volver al carrito</a>}
    </section>}
  </main>;
}
