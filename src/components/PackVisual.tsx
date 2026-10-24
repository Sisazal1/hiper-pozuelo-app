// Panel visual del pack: bloque de color propio + caja isométrica dibujada en CSS.
// No hay fotografía ni WebGL: la caja es geometría con transform 3D, pesa 0 KB y no pide red.
// Es decorativo (aria-hidden): el número y el nombre ya están en texto en la tarjeta.
const ACCENTS: Record<string, [string, string]> = {
  bano: ['#0E7490', '#155E75'],
  cocina: ['#C2410C', '#9A3412'],
  habitacion: ['#4338CA', '#3730A3'],
  completo: ['#BE123C', '#9F1239'],
};

export function PackVisual({slug, units, size = 'card'}: {slug: string; units: number; size?: 'card' | 'hero'}) {
  const [a, b] = ACCENTS[slug] ?? ['#1F2937', '#111827'];
  return (
    <div className={`pv pv-${size}`} style={{'--pv-a': a, '--pv-b': b} as React.CSSProperties} aria-hidden="true">
      <div className="pv-stage">
        <div className="pv-cube">
          <span className="pv-face pv-top" />
          <span className="pv-face pv-front" />
          <span className="pv-face pv-side" />
        </div>
      </div>
      <div className="pv-meta">
        <strong>{units}</strong>
        <span>artículos</span>
      </div>
    </div>
  );
}
