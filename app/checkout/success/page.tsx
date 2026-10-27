'use client';
import {useEffect} from 'react';
import Link from 'next/link';

export default function Success() {
  useEffect(() => {
    try { localStorage.removeItem('cart'); window.dispatchEvent(new Event('cart:change')); } catch {}
  }, []);
  return <main className=\"main wrap\"><h1 className=\"h1\">Pedido recibido</h1><p>Gracias por tu compra. Puedes ver tu pase de recogida desde el enlace que recibiste o desde tu pedido.</p><p><Link href=\"/packs\">Volver a la tienda</Link></p></main>;
}