import {packs} from '../content/packs.ts';
import {ADDONS} from '../content/addons.ts';

export type Rec = {
  type: 'complementary' | 'alternative' | 'bundle';
  slug?: string;
  addonId?: string;
  reason: string;
  priceCents: number;
  highlight?: string;
};

export function getRecommendations(input: {currentSlug?: string; cartSlugs?: string[]} = {}): Rec[] {
  const recs: Rec[] = [];
  const inCart = new Set(input.cartSlugs || []);
  
  if (input.currentSlug) {
    const p = packs.find((x: any) => x.slug === input.currentSlug);
    if (p) {
      for (const addon of ADDONS.slice(0, 2)) {
        if (!inCart.has(addon.id)) {
          recs.push({
            type: 'complementary',
            addonId: addon.id,
            reason: 'Completa lo que falta para tu primer día.',
            priceCents: addon.priceCents
          });
        }
      }
    }
    const order = ['bano', 'cocina', 'habitacion', 'completo'];
    const idx = order.indexOf(input.currentSlug);
    if (idx >= 0 && idx < order.length - 1) {
      const better = packs.find((x: any) => x.slug === order[idx + 1]);
      if (better && !inCart.has(better.slug)) {
        const current = packs.find((x: any) => x.slug === input.currentSlug);
        const diff = better.priceCents - (current?.priceCents || 0);
        recs.push({
          type: 'alternative',
          slug: better.slug,
          reason: diff > 0 ? ('Mejora a ' + better.name + ' por +' + (diff/100).toFixed(2) + '€ y cubre más.') : ('Mejora a ' + better.name + '.'),
          priceCents: better.priceCents
        });
      }
    }
  }
  
  const bath = packs.find((p: any) => p.slug === 'bano');
  const cook = packs.find((p: any) => p.slug === 'cocina');
  const room = packs.find((p: any) => p.slug === 'habitacion');
  const comp = packs.find((p: any) => p.slug === 'completo');
  if (bath && cook && room && comp) {
    const sum = bath.priceCents + cook.priceCents + room.priceCents;
    const saving = sum - comp.priceCents;
    if (saving > 0) {
      recs.push({
        type: 'bundle',
        slug: 'completo',
        reason: 'Bundle: baño+cocina+habitación vs completo. Ahorro real: ' + (saving/100).toFixed(2) + '€ en una sola recogida.',
        priceCents: comp.priceCents,
        highlight: 'Ahorro ' + (saving/100).toFixed(2) + '€'
      });
    } else if (saving === 0) {
      recs.push({
        type: 'bundle',
        slug: 'completo',
        reason: 'Una sola compra y una recogida: más práctico aunque sin ahorro.',
        priceCents: comp.priceCents
      });
    }
  }
  
  const filtered = recs.filter((r: any) => {
    if (r.slug && inCart.has(r.slug)) return false;
    if (r.addonId && inCart.has(r.addonId)) return false;
    return true;
  });
  return filtered.slice(0, 3);
}