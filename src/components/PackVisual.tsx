const ACCENTS: Record<string, string> = {bano: '#E30613', cocina: '#C8102E', habitacion: '#24201D', completo: '#B00E1F'};

function Face({kind}: {kind: 'front' | 'top' | 'side'}) {
  return <i className={`pv-face pv-${kind}`} aria-hidden="true"/>;
}

function Box({variant}: {variant: string}) {
  return <div className={`pv-box pv-box-${variant}`}><Face kind="front"/><Face kind="top"/><Face kind="side"/></div>;
}

export function PackVisual({slug, units, size = 'card'}: {slug: string; units: number; size?: 'card' | 'hero' | 'small'}) {
  const accent = ACCENTS[slug] ?? ACCENTS.completo;
  return (
    <div className={`pv pv-${size} pv-${slug}`} style={{'--pv-a': accent} as React.CSSProperties} aria-hidden="true">
      <div className="pv-art">
        {slug === 'bano' && <><Box variant="bano"/><span className="pv-fold pv-fold-1"/><span className="pv-fold pv-fold-2"/></>}
        {slug === 'cocina' && <><Box variant="cocina"/><span className="pv-pan"/></>}
        {slug === 'habitacion' && <><Box variant="habitacion"/><span className="pv-mattress"/></>}
        {(slug === 'completo' || !ACCENTS[slug]) && <><Box variant="full-1"/><Box variant="full-2"/><Box variant="full-3"/></>}
      </div>
      <div className="pv-meta"><strong>{units}</strong><span>artículos</span></div>
    </div>
  );
}
