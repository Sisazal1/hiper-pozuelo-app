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
// consumes them only while the hold is alive.
// R-049 (r3), D-065 §2: NULL does NOT mean "active forever". That reading was right about the
// direction of safety and wrong about its duration — nothing ever ended the hold, so one legacy row
// could consume a window for good and `refund` refuses an unpaid order, leaving staff no remedy. A
// row with no recorded expiry falls back to its own `created_at + HOLD` (the clock started at
// creation, not at the migration), and a pending row with no date at all is not a hold.
export function holdIsActive(status: string, expiresAt: string | null, now = new Date(), createdAt?: string | null): boolean {
  if (status === 'paid' || status === 'collected') return true;
  if (status !== 'pending') return false;
  const recorded = expiresAt ? new Date(expiresAt).getTime() : NaN;
  const end = Number.isNaN(recorded) && createdAt ? new Date(holdExpiresAt(createdAt)).getTime() : recorded;
  if (Number.isNaN(end)) return false;
  return end > now.getTime();
}
