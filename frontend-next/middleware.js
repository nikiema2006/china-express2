import { NextResponse } from 'next/server';

export async function middleware(request) {
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/admin/login';

  // Check for Supabase auth cookies (they start with 'sb-' and contain 'auth-token')
  let hasSession = false;
  request.cookies.getAll().forEach((cookie) => {
    if (cookie.name.includes('auth-token')) {
      hasSession = true;
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
