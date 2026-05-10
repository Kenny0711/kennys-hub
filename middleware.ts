import { ADMIN_AUTH_COOKIE, isValidAdminToken } from './src/lib/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(ADMIN_AUTH_COOKIE)?.value;
  const isAdmin = await isValidAdminToken(token);

  if (isAdmin) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/login';
  loginUrl.searchParams.set('next', request.nextUrl.pathname);

  if (!process.env.ADMIN_PASSWORD) {
    loginUrl.searchParams.set('error', 'config');
  }

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*'],
};
