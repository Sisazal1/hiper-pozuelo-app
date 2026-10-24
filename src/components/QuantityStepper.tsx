'use client';
export function QuantityStepper({value, onDecrease, onIncrease, onRemove, label}: {value: number; onDecrease: () => void; onIncrease: () => void; onRemove: () => void; label: string}) {
  const atMin = value <= 1, atMax = value >= 5;
  return <div className="quantity-stepper"><button type="button" aria-label={atMin ? `No se puede reducir ${label}: mínimo 1` : `Reducir ${label}`} title={atMin ? 'Mínimo 1' : undefined} disabled={atMin} onClick={onDecrease}>−</button><span aria-live="polite">{value}</span><button type="button" aria-label={atMax ? `No se puede aumentar ${label}: máximo 5` : `Aumentar ${label}`} title={atMax ? 'Máximo 5' : undefined} disabled={atMax} onClick={onIncrease}>+</button><button type="button" aria-label={`Quitar ${label} del carrito`} onClick={onRemove}>Quitar</button></div>;
}
