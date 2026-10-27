import fs from 'node:fs';
import path from 'node:path';
import {database} from '@/src/lib/db';
import {computeKPIs} from '@/src/lib/kpi';

export const dynamic = 'force-dynamic';
export const metadata = {title: 'KPIs', description: 'Panel de KPIs', robots: {index: false, follow: false}};

export default function KPIs() {
  try {
    const db = database();
    const orders = db.prepare('SELECT * FROM orders').all();
    let events: any[] = [];
    try {
      const file = path.resolve(process.env.EVENT_LOG_PATH ?? 'data/events.log');
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        events = content.trim().split(/\n/).filter(Boolean).map(l => {
          try { return JSON.parse(l); } catch { return {}; }
        });
      }
    } catch {}
    const {real, hypotheses} = computeKPIs(events, orders);
    return <main className=\"main wrap\"><h1 className=\"h1\">Panel de KPIs</h1>
      <p><strong>Demostración académica.</strong> Datos reales separados de hipótesis.</p>
      <h2>Datos reales (de esta base de datos)</h2>
      <table className=\"table\"><thead><tr><th>Métrica</th><th>Valor</th><th>n</th><th>Nota</th></tr></thead><tbody>
        {real.map((r,i) => <tr key={i}><td>{r.name}</td><td>{r.value === null ? '-' : (r.unit === '%' ? (r.value*100).toFixed(1)+'%' : r.unit === '€' ? r.value.toFixed(2)+' €' : r.value)}</td><td>{r.n ?? '-'}</td><td>{r.note || ''}</td></tr>)}
      </tbody></table>
      <h2>Hipótesis (objetivos)</h2>
      <table className=\"table\"><thead><tr><th>Métrica</th><th>Valor objetivo</th><th>Estado</th></tr></thead><tbody>
        {hypotheses.map((h,i) => <tr key={i}><td>{h.name}</td><td>{h.value === null ? '-' : (h.unit === '%' ? (h.value*100).toFixed(1)+'%' : h.value)}</td><td>{h.note || 'HIPÓTESIS'}</td></tr>)}
      </tbody></table>
      <p>Margen: sin datos de coste.</p>
    </main>;
  } catch (e) {
    return <main className=\"main wrap\"><h1 className=\"h1\">Panel de KPIs</h1><p>Error al cargar KPIs.</p></main>;
  }
}