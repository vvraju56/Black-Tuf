import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_COOKIE = 'btt_admin_token';

/**
 * Gate the admin area before rendering starts.
 *
 * The protected layout still calls `requireAdmin()` and validates the token
 * against the API. This middleware exists so an unauthenticated request gets a
 * real 307 redirect instead of a streamed page with a client-side redirect,
 * which would otherwise happen because the root loading boundary flushes early.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  if (!request.cookies.get(ADMIN_COOKIE)?.value) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/admin/login';
    loginUrl.search = '';
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
