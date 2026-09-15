import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'fallback-secret-change-in-production-32ch'
);

const PROTECTED = ['/dashboard', '/cars', '/customers', '/rentals', '/reservations', '/calendar', '/reports', '/settings'];
const PUBLIC_API = ['/api/auth/login', '/api/booking-requests', '/api/public'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/booking-requests') ||
    pathname.startsWith('/api/public') ||
    pathname === '/login' ||
    pathname === '/' ||
    pathname.startsWith('/fleet') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Protect admin routes and API
  const isProtectedPage = PROTECTED.some(p => pathname.startsWith(p));
  const isProtectedApi = pathname.startsWith('/api/') && !PUBLIC_API.some(p => pathname.startsWith(p));

  if (isProtectedPage || isProtectedApi) {
    const token = request.cookies.get('cr_session')?.value;
    if (!token) {
      if (isProtectedApi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return NextResponse.redirect(new URL('/login', request.url));
    }
    try {
      await jwtVerify(token, SECRET);
      return NextResponse.next();
    } catch {
      if (isProtectedApi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
