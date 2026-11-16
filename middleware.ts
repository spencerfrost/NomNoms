import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { env } from './lib/env';

export async function middleware(request: NextRequest) {
  // Protect write operations (POST, PUT, DELETE) on recipe routes
  if (
    request.nextUrl.pathname.startsWith('/api/recipes') &&
    ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)
  ) {
    const token = await getToken({
      req: request,
      secret: env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
  }

  // Protect the /add and /discover pages
  const { pathname } = request.nextUrl;
  if (
    pathname === '/add' ||
    pathname.startsWith('/add/') ||
    pathname === '/discover' ||
    pathname.startsWith('/discover/')
  ) {
    const token = await getToken({
      req: request,
      secret: env.NEXTAUTH_SECRET,
    });

    if (!token) {
      // Keep the query (e.g. a clipped ?url=) so sign-in returns to the same preview.
      const signIn = new URL('/auth/signin', request.url);
      signIn.searchParams.set('callbackUrl', `${pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(signIn);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/recipes/:path*', '/add/:path*', '/discover/:path*'],
};
