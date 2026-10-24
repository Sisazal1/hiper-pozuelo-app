import {createOrder} from '@/src/server/orders';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = createOrder({lines: body.lines, name: body.name, phone: body.phone, slotId: body.slotId, sessionId: body.session_id});
    // D-065 §3: a second tab asking for the same purchase is a conflict, not a new order. The body
    // carries no order reference and no token, so the caller learns nothing about the other tab's
    // ticket; the sentence the customer reads lives in the copy constants, not in this response.
    if (result.duplicate) return Response.json({duplicate: true}, {status: 409});
    return Response.json(result);
  } catch (error) {
    return Response.json({error: error instanceof Error ? error.message : 'No hemos podido crear el pedido.'}, {status: 400});
  }
}

