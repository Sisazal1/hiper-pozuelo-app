import {SimulatedProvider} from '@/src/lib/payments';
import {findByRef, findByToken, markPaid} from '@/src/server/orders';
export const runtime = 'nodejs';

// B-7: the pass token is required. An order_ref alone is a short, guessable-shaped id, so a caller
// who never bought anything could pay for — and then collect — somebody else's order.
// 404 rather than 403 on purpose: a 403 would confirm that the order exists.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderRef = typeof body.orderRef === 'string' ? body.orderRef : '';
    const token = typeof body.token === 'string' ? body.token : '';
    const row = token ? findByToken(token) : undefined;
    if (!row || !orderRef || row.order_ref !== orderRef) return Response.json({error: 'Pedido no encontrado'}, {status: 404});
    const result = await new SimulatedProvider().confirm(orderRef);
    const status = markPaid(orderRef, result, body.session_id);
    return Response.json({status, pickup_code: findByRef(orderRef)?.pickup_code});
  } catch (error) {
    return Response.json({error: error instanceof Error ? error.message : 'No hemos podido confirmar el pago.'}, {status: 400});
  }
}
