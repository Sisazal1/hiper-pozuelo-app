export type KPI = {
  name: string;
  value: number | null;
  n?: number;
  unit?: string;
  source: 'real' | 'hypothesis';
  note?: string;
};

export function computeKPIs(events: any[] = [], orders: any[] = []): {real: KPI[]; hypotheses: KPI[]} {
  const real: KPI[] = [];
  const hypotheses: KPI[] = [];
  
  // Real data
  const views = events.filter(e => e.type === 'pack_view').length;
  const adds = events.filter(e => e.type === 'add_to_cart').length;
  const paid = orders.filter(o => o.status === 'paid' || o.status === 'collected').length;
  const collected = orders.filter(o => o.status === 'collected').length;
  
  real.push({name: 'Vistas de pack', value: views, n: views, source: 'real'});
  real.push({name: 'Añadidos al carrito', value: adds, n: adds, source: 'real'});
  real.push({name: 'Pedidos pagados/recogidos', value: paid, n: paid, source: 'real'});
  real.push({name: 'Pedidos recogidos', value: collected, n: collected, source: 'real'});
  
  if (views > 0) {
    real.push({name: 'Conversión vista→añadir', value: adds / views, unit: '%', n: views, source: 'real'});
  } else {
    real.push({name: 'Conversión vista→añadir', value: null, n: 0, source: 'real', note: 'muestra insuficiente'});
  }
  
  const totals = orders.filter(o => o.total_cents).map(o => o.total_cents);
  if (totals.length > 0) {
    const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
    real.push({name: 'Valor medio pedido', value: avg / 100, unit: '€', n: totals.length, source: 'real'});
  } else {
    real.push({name: 'Valor medio pedido', value: null, n: 0, source: 'real', note: 'sin datos'});
  }
  
  // Hypotheses
  hypotheses.push({name: 'Conversión objetivo', value: 0.15, unit: '%', source: 'hypothesis', note: 'HIPÓTESIS - sin línea base inventada'});
  
  return {real, hypotheses};
}