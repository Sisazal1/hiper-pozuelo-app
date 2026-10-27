export type VariantDef = {
  id: string;
  label: string;
  priceDeltaCents?: number;
  note?: string;
};

export const PACK_VARIANTS: Record<string, VariantDef[]> = {
  habitacion: [
    {id: '90', label: 'Cama 90 cm'},
    {id: '135', label: 'Cama 135 cm'},
    {id: '150', label: 'Cama 150 cm'}
  ]
};