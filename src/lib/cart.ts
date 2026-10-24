import {packs} from '@/src/content/packs';
import {mergeLines, validQty} from '@/src/lib/lines';
export type {Line as CartLine} from '@/src/lib/lines';
export {validQty};

// A price is always summed over one line per pack (m-1), so a cart that reached the page as two
// lines of the same slug cannot be counted twice here either.
export function total(lines: {slug: string; qty: number}[]) {
  return mergeLines(lines).reduce((sum, line) => sum + (packs.find(p => p.slug === line.slug)?.priceCents ?? 0) * line.qty, 0);
}
