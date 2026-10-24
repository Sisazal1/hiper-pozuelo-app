import type {ReactElement} from 'react';
const ACCENTS: Record<string, string> = {bano: '#E30613', cocina: '#C8102E', habitacion: '#1A1A1A', completo: '#E30613'};
const ICONS: Record<string, ReactElement> = {
  bano: <><circle cx="58" cy="62" r="14"/><path d="M45 78h26M52 88h12"/></>,
  cocina: <><path d="M48 52h20v28H48zM44 52h28M52 42v10M64 42v10"/><circle cx="58" cy="66" r="4"/></>,
  habitacion: <><path d="M43 80V62l15-13 15 13v18M49 80V66h18v14"/><path d="M55 73h6"/></>,
  completo: <><path d="M43 78h30M48 78V58h20v20M52 58v-8h12v8M54 67h8"/></>,
};

export function PackVisual({slug, units, size = 'card'}: {slug: string; units: number; size?: 'card' | 'hero' | 'small'}) {
  const accent = ACCENTS[slug] ?? '#1A1A1A';
  return (
    <div className={`pv pv-${size}`} style={{'--pv-a': accent, display: 'flex', flexDirection: 'column'} as React.CSSProperties} aria-hidden="true">
      <svg className="pv-svg" viewBox="0 0 180 140" width="180" height="140" focusable="false"><path className="pv-shadow" d="M20 116 91 91l70 25-70 20z"/><path className="pv-box pv-box-top" d="m28 50 63-25 62 25-62 26z"/><path className="pv-box pv-box-front" d="M28 50v54l63 26V76z"/><path className="pv-box pv-box-side" d="M91 76v54l62-26V50z"/><path className="pv-line" d="m91 76 62-26M91 76 28 50"/><g className="pv-icon">{ICONS[slug] ?? ICONS.completo}</g></svg>
      <div className="pv-meta" style={{display: 'flex', alignItems: 'baseline', gap: 8}}>
        <strong>{units}</strong>
        <span>artículos</span>
      </div>
    </div>
  );
}
