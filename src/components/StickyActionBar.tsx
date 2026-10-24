'use client';
import {useEffect, useState} from 'react';
import Link from 'next/link';

export function StickyActionBar({slug, price, label}: {slug: string; price: string; label: string}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => setVisible(window.scrollY >= 300 && document.documentElement.scrollHeight - window.innerHeight - window.scrollY > 180);
    update(); window.addEventListener('scroll', update, {passive: true}); return () => window.removeEventListener('scroll', update);
  }, []);
  return <div className={`sticky-action-bar${visible ? ' is-visible' : ''}`} aria-hidden={!visible}><span>{price}</span><Link className="btn" href={`/packs/${slug}#comprar`}>{label}</Link></div>;
}
