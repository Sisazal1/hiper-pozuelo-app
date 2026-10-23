import {packs} from '@/src/content/packs';
export type CartLine={slug:string;qty:number}; export function total(lines:CartLine[]){return lines.reduce((sum,line)=>sum+(packs.find(p=>p.slug===line.slug)?.priceCents??0)*line.qty,0)}
export function validQty(qty:number){return Number.isInteger(qty)&&qty>=1&&qty<=5}
