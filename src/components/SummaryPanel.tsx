import Link from 'next/link';
import {eur} from '@/src/lib/format';
import {PRICE_LABEL} from '@/src/content/price';
export function SummaryPanel({amount}: {amount: number}) {return <section className="summary-panel"><h2>Resumen</h2><div><span>Subtotal</span><strong>{eur(amount)}</strong></div><p>Recogida en tienda · Gratis</p><div><span>Total</span><strong className="price">{eur(amount)}</strong></div><span className="label">{PRICE_LABEL['ASSUMED-demo']}</span><Link className="btn" href="/checkout">Continuar · {eur(amount)}</Link></section>}
