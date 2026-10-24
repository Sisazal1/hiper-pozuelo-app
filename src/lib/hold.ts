// R-049: the hold a pending order puts on its window. Kept in its own alias-free module so
// `node --test` can import the real predicate instead of restating it (R-099b).
export const HOLD_MINUTES_DEFAULT = 10;

export function holdMinutes(): number {
  const raw = process.env.HOLD_MINUTES;
  if (raw === undefined) return HOLD_MINUTES_DEFAULT;
  const minutes = Number(raw);
  return Number.isFinite(minutes) && minutes >= 0 ? minutes : HOLD_MINUTES_DEFAULT;
}

export function holdExpiresAt(createdAt: string | Date, minutes = holdMinutes()): string {
  const start = createdAt instanceof Date ? createdAt.getTime() : new Date(createdAt).getTime();
  if (Number.isNaN(start)) throw Error('Fecha de creación no válida para la reserva');
  return new Date(start + minutes * 60_000).toISOString();
}

// What the window sees. A paid or collected order consumes its minutes forever; a pending one
// consumes them only while the hold is alive. NULL means no hold was recorded (an order created
// before R-049) and is treated as active, so a migration never silently overbooks.
export function holdIsActive(status: string, expiresAt: string | null, now = new Date()): boolean {
  if (status === 'paid' || status === 'collected') return true;
  if (status !== 'pending') return false;
  if (!expiresAt) return true;
  const end = new Date(expiresAt).getTime();
  if (Number.isNaN(end)) return true;
  return end > now.getTime();
}
