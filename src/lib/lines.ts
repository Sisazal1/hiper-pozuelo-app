// m-1 (D-063): one line per pack. Two lines for the same slug used to reach the order as two
// sections with the same React key and two price rows, so the same cart could be counted twice.
// Alias-free on purpose: `node --test` imports this module, not a copy of the rule.
export type Line = {slug: string; qty: number};

export function mergeLines(lines: Line[]): Line[] {
  const merged = new Map<string, number>();
  for (const line of lines) merged.set(line.slug, (merged.get(line.slug) ?? 0) + line.qty);
  return [...merged.entries()].map(([slug, qty]) => ({slug, qty}));
}

// The per-line bound is 1–5 (R-023). It is applied to what the customer sent, before merging, so a
// merged line may legally exceed 5: 5 + 5 of one pack is two legal lines, not one illegal one.
export function validQty(qty: number): boolean {
  return Number.isInteger(qty) && qty >= 1 && qty <= 5;
}
