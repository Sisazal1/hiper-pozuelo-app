export type AddOn = {
  id: string;
  name: string;
  priceCents: number;
  dataStatus: 'ASSUMED-demo' | 'VERIFIED';
  rooms?: string[];
  notes?: string;
};

export const ADDONS: AddOn[] = [
  { id: 'addon-fregona', name: 'Fregona + cubo', priceCents: 800, dataStatus: 'ASSUMED-demo', rooms: ['limpieza'], notes: 'Precio de demostración' },
  { id: 'addon-detergente', name: 'Detergente ropa 30 lavados', priceCents: 500, dataStatus: 'ASSUMED-demo', rooms: ['limpieza'], notes: 'Precio de demostración' },
  { id: 'addon-multiusos', name: 'Limpiador multiusos 750 ml', priceCents: 300, dataStatus: 'ASSUMED-demo', rooms: ['limpieza'], notes: 'Precio de demostración' },
  { id: 'addon-bayetas', name: 'Bayetas (paquete)', priceCents: 200, dataStatus: 'ASSUMED-demo', rooms: ['limpieza'], notes: 'Precio de demostración' },
  { id: 'addon-guantes', name: 'Guantes de limpieza', priceCents: 150, dataStatus: 'ASSUMED-demo', rooms: ['limpieza'], notes: 'Precio de demostración' }
];