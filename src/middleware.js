import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { verifyToken } from './lib/verifyToken';

const PUBLIC_ONLY_ROUTES = ['/login', '/signup','/'];
const PUBLIC_ROUTES = []; 

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  const payload = await verifyToken(req);
  const isAuthenticated = Boolean(payload);

  const isPublic = PUBLIC_ROUTES.includes(pathname);
  const isPublicOnly = PUBLIC_ONLY_ROUTES.includes(pathname);

  // Prevent logged-in users from accessing login/register pages
  if (isAuthenticated && isPublicOnly) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Allow everyone to access truly public routes (like '/')
  if (isPublic) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users away from protected routes
  if (!isAuthenticated && !isPublicOnly && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/.*|favicon.ico|manifest.json|.*\\.png|.*\\.svg|.*\\.webmanifest|robots.txt|service-worker.js|api/.*).*)',
  ],
};