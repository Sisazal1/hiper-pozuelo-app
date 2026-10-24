// Minutes of packing each pack needs. Source of truth: data/pack-price-sheet.csv →
// pack_assembly_minutes. tests/capacity.test.mjs re-reads the CSV row by row, so a change to the
// sheet fails the build instead of silently changing what a window can hold.
// data/pack-price-sheet.csv:pack_assembly_minutes (VERIFIED)
export const ASSEMBLY_MINUTES = {bano: 8, cocina: 10, habitacion: 10, completo: 18} as const;

export type CapacityLine = {slug: string; qty: number};
export type SlotCapacity = {minutes: number | null; units: number | null};
export type SlotUsage = {minutes: number; units: number};
export type CapacityVerdict = {ok: true} | {ok: false; reason: 'minutes' | 'units'; message: string};

export function assemblyMinutes(slug: string): number {
  const minutes = ASSEMBLY_MINUTES[slug as keyof typeof ASSEMBLY_MINUTES];
  if (minutes === undefined) throw Error(`Sin minutos de montaje para el pack ${slug}`);
  return minutes;
}

export function requiredMinutes(lines: CapacityLine[]): number {
  return lines.reduce((sum, line) => sum + assemblyMinutes(line.slug) * line.qty, 0);
}

// R-042b: capacity is checked and refused — never truncated, never accepted. A null limit means
// "not applied" (Q5 has no number yet), which is why each limit is checked on its own rather than
// the row being skipped: the day Q5 lands, the check starts enforcing without a code change.
export function fits(capacity: SlotCapacity, used: SlotUsage, add: SlotUsage): CapacityVerdict {
  if (capacity.minutes !== null && used.minutes + add.minutes > capacity.minutes) {
    return {ok: false, reason: 'minutes', message: 'Esta franja no tiene capacidad para ese pedido. Elige otra hora.'};
  }
  if (capacity.units !== null && used.units + add.units > capacity.units) {
    return {ok: false, reason: 'units', message: 'Esta franja no tiene plazas suficientes para ese pedido. Elige otra hora.'};
  }
  return {ok: true};
}
