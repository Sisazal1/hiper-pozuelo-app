// R-095: a window is rendered in Europe/Madrid wall-clock time, never as a fixed offset and never
// as the order's created_at. Resolving through the IANA zone at format time is what keeps the same
// 10:00 slot reading 10:00 in the week the clocks change.
const MADRID = 'Europe/Madrid';
const dayFormat = new Intl.DateTimeFormat('es-ES', {timeZone: MADRID, weekday: 'long', day: 'numeric', month: 'long'});
const timeFormat = new Intl.DateTimeFormat('es-ES', {timeZone: MADRID, hour: '2-digit', minute: '2-digit', hour12: false});

export function slotLabel(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) throw Error('Franja con fechas no válidas');
  if (end.getTime() <= start.getTime()) throw Error('Una franja no puede terminar antes de empezar');
  return `${dayFormat.format(start)} · ${timeFormat.format(start)}–${timeFormat.format(end)}`;
}
