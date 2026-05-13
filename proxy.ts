import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Paths that are public (don't require a token)
  const isPublicPath = pathname === '/' || pathname === '/login' || pathname.startsWith('/api/auth');

  if (!token && !isPublicPath) {
    // If no token and trying to access a protected path, redirect to login (root)
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (token && (pathname === '/' || pathname === '/login')) {
    // If already logged in and trying to access login page, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
