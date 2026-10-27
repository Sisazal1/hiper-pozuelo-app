'use client';
import {PACK_VARIANTS} from '@/src/content/variants';

export function VariantSelector({slug, value, onChange}: {slug: string; value: string; onChange: (v: string) => void}) {
  const vars = PACK_VARIANTS[slug];
  if (!vars || vars.length === 0) return null;
  return <div className=\"variant-selector\" role=\"radiogroup\" aria-label=\"Tamaño/variante\">
    {vars.map(v => <label key={v.id} className=\"variant-option\"><input type=\"radio\" name=\"variant\" value={v.id} checked={value === v.id} onChange={() => onChange(v.id)} aria-checked={value === v.id}/><span>{v.label}</span></label>)}
  </div>;
}