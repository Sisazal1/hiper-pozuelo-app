import raw from './packs.generated.json' with {type: 'json'};
export type Pack = typeof raw[number];
export const packs = raw as Pack[];
export function getPack(slug: string) { return packs.find(p => p.slug === slug); }