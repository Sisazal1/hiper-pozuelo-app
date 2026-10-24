import {collect, findByCode, refund} from '@/src/server/orders';
export const runtime = 'nodejs';

// R-057: one input, one action. `lookup` is the screen's read; collect and refund only ever act on
// an order that exists, and refund takes the real order_ref — never the pickup code it used to be
// handed, which made "Anular pedido" answer `Pedido no encontrado` on every press.
export async function POST(req: Request) {
  try {
    const body: Record<string, unknown> = await req.json();
    const code = typeof body.pickup_code === 'string' ? body.pickup_code.trim().toUpperCase() : '';
    if (body.action === 'lookup') {
      const row = findByCode(code);
      if (!row) return Response.json({error: 'Código no encontrado.'}, {status: 404});
      return Response.json({order: {orderRef: row.order_ref, status: row.status, pickedUpAt: row.collected_at}});
    }
    if (body.action === 'refund') {
      const orderRef = typeof body.orderRef === 'string' ? body.orderRef : '';
      if (!orderRef) return Response.json({error: 'Pedido no encontrado'}, {status: 400});
      return Response.json(refund(orderRef, 'Solicitud de mostrador'));
    }
    const result = collect(code, typeof body.session_id === 'string' ? body.session_id : '');
    return Response.json({status: result.status, order_ref: result.row.order_ref, pickup_code: result.row.pickup_code});
  } catch (error) {
    return Response.json({error: error instanceof Error ? error.message : 'No se ha podido actualizar el pedido.'}, {status: 400});
  }
}
