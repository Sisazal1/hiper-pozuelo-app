// m-1 (D-063): one line per pack. With variants, same slug+variant merge.
export type Line = {slug: string; qty: number; variant?: string};

export function mergeLines(lines: Line[]): Line[] {
  const merged = new Map<string, number>();
  for (const line of lines) {
    const key = line.slug + '::' + (line.variant || 'default');
    merged.set(key, (merged.get(key) ?? 0) + line.qty);
  }
  return [...merged.entries()].map(([key, qty]) => {
    const [slug, variant] = key.split('::');
    if (variant === 'default') return {slug, qty};
    return {slug, qty, variant};
  });
}

export function validQty(qty: number): boolean {
  return Number.isInteger(qty) && qty >= 1 && qty <= 5;
}