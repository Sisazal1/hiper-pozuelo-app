export type Room = 'baño' | 'cocina' | 'habitación' | 'limpieza';
export type Category = 'aseo' | 'menaje' | 'vajilla' | 'textil' | 'limpieza' | 'dormitorio';

export const ROOM_LABEL: Record<Room, string> = {
  baño: 'Baño',
  cocina: 'Cocina',
  habitación: 'Habitación',
  limpieza: 'Limpieza'
};

export function roomFromGroup(group: string): Room {
  const g = group.toLowerCase();
  if (g === 'aseo') return 'baño';
  if (g === 'limpieza') return 'limpieza';
  if (g === 'menaje' || g === 'vajilla' || g === 'textil') return 'cocina';
  if (g === 'dormitorio') return 'habitación';
  return 'limpieza';
}

export function categoryFromGroup(group: string): Category {
  const g = group.toLowerCase();
  if (g === 'aseo') return 'aseo';
  if (g === 'menaje') return 'menaje';
  if (g === 'vajilla') return 'vajilla';
  if (g === 'textil') return 'textil';
  if (g === 'limpieza') return 'limpieza';
  if (g === 'dormitorio') return 'dormitorio';
  return 'limpieza';
}