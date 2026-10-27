import {NextResponse} from 'next/server';
import {addReview} from '@/src/lib/reviews';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {orderRef, packSlug, rating, comment} = body || {};
    if (!orderRef || !packSlug || !rating) return NextResponse.json({error: 'Faltan datos'}, {status: 400});
    addReview(orderRef, packSlug, Number(rating), String(comment || ''));
    return NextResponse.json({ok: true});
  } catch (e: any) {
    return NextResponse.json({error: e.message || 'Error'}, {status: 400});
  }
}