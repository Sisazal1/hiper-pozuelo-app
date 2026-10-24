// Availability labels are the three R-004 states. Keyed by the value the pack data already carries,
// so a fourth state cannot be rendered as green by accident: availabilityLabel throws instead.
// DELIBERATE: `as const satisfies Record<...>` over a local union, because the JSON import types
// `availability` as `string` and would accept any value at compile time.
export const AVAILABILITY_LABEL = {
  in_stock: 'Disponible',
  low_stock: 'Últimas unidades',
  sold_out: 'Agotado',
} as const;

export type Availability = keyof typeof AVAILABILITY_LABEL;

export function availabilityLabel(value: string): string {
  const label = AVAILABILITY_LABEL[value as Availability];
  if (label === undefined) throw Error(`Estado de disponibilidad sin etiqueta: ${value}`);
  return label;
}
