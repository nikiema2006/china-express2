import { NextResponse } from 'next/server';

export async function middleware(request) {
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/admin/login';

  // Check for Supabase auth cookies - Supabase sets cookies like:
  // sb-{project-ref}-auth-token (contains session info)
  let hasSession = false;
  request.cookies.getAll().forEach((cookie) => {
    if (cookie.name.includes('auth-token') && cookie.value && cookie.value !== 'null') {
      try {
        // Verify it's not empty or malformed
        const parsed = JSON.parse(decodeURIComponent(cookie.value));
        if (parsed && parsed.length > 0) {
          hasSession = true;
        }
      } catch {
        // Cookie might be in a different format, treat as valid if present
        if (cookie.value.length > 10) {
          hasSession = true;
        }
      }
    }
  });

  // If trying to access protected route without session, redirect to login
  if (isProtectedRoute && !isLoginPage && !hasSession) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If already logged in and on login page, redirect to admin
  if (isLoginPage && hasSession) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
