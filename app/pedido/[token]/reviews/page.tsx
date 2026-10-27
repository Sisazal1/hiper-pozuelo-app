'use client';
import {useEffect, useState} from 'react';
import {useParams} from 'next/navigation';

export default function ReviewsPage() {
  const params = useParams<{token: string}>();
  const token = params?.token || '';
  const [order, setOrder] = useState<any>(null);
  const [form, setForm] = useState({packSlug: '', rating: 5, comment: ''});
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/pedido/' + token).then(r => r.json()).then(d => setOrder(d.order)).catch(()=>{});
  }, [token]);

  async function submit(e: any) {
    e.preventDefault();
    setMsg('');
    try {
      const res = await fetch('/api/reviews', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({orderRef: order?.order_ref, packSlug: form.packSlug, rating: form.rating, comment: form.comment})});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setMsg('Gracias por tu opinión');
    } catch (err: any) {
      setMsg(err.message);
    }
  }

  if (!order) return <main className=\"main wrap\"><h1 className=\"h1\">Opinión</h1><p>Cargando...</p></main>;
  if (order.status !== 'collected') return <main className=\"main wrap\"><h1 className=\"h1\">Opinión</h1><p>Solo pueden opinar quienes ya han recogido su pedido.</p></main>;

  let packs: any[] = [];
  try { packs = JSON.parse(order.contents_snapshot || '[]'); } catch {}

  return <main className=\"main wrap\"><h1 className=\"h1\">Deja tu opinión</h1><p>Una opinión por pedido y pack. Compra verificada.</p>{msg ? <p>{msg}</p> : null}<form onSubmit={submit}><label>Pack<select value={form.packSlug} onChange={e => setForm({...form, packSlug: e.target.value})} required>{packs.map((p: any) => <option key={p.slug} value={p.slug}>{p.slug}</option>)}</select></label><label>Valoración<select value={form.rating} onChange={e => setForm({...form, rating: Number(e.target.value)})}>{[5,4,3,2,1].map(n => <option key={n} value={n}>{n} estrellas</option>)}</select></label><label>Comentario<textarea value={form.comment} onChange={e => setForm({...form, comment: e.target.value})} /></label><button className=\"btn\" type=\"submit\">Enviar</button></form></main>;
}