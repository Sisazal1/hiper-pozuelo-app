import {NextResponse, type NextRequest} from 'next/server';
export function middleware(request: NextRequest) { const headers = new Headers(request.headers); headers.set('x-site-lang', request.nextUrl.pathname === '/' && request.nextUrl.searchParams.get('lang') === 'en' ? 'en' : 'es'); return NextResponse.next({request: {headers}}); }
export const config = {matcher: ['/((?!_next|api|favicon.ico).*)']};
