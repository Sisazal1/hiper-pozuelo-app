const results=new Map<string,'paid'|'declined'>();
export interface PaymentProvider{confirm(orderRef:string):Promise<'paid'|'declined'>}
export class SimulatedProvider implements PaymentProvider{async confirm(orderRef:string){const prior=results.get(orderRef);if(prior)return prior;const result='paid';results.set(orderRef,result);return result}}
