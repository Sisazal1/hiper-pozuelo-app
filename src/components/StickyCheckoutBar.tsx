'use client';
import Link from 'next/link';
import {eur} from '@/src/lib/format';
export function StickyCheckoutBar({amount}: {amount: number}) {return <div className="sticky-checkout-bar"><span>{eur(amount)}</span><Link className="btn" href="#checkout-action">Continuar</Link></div>}
