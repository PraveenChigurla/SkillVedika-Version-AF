import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Security Headers Middleware
 *
 * Implements comprehensive security headers for protection against:
 * - XSS attacks
 * - Clickjacking
 * - MIME type sniffing
 * - Protocol downgrade attacks
 * - Content injection
 */
export function middleware(_request: NextRequest) {
  const response = NextResponse.next();
  const isProduction = process.env.NODE_ENV === 'production';

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // HSTS (HTTP Strict Transport Security) - Only in production
  if (isProduction) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Content Security Policy
  // Note: CSP should be carefully configured based on your needs
  // This is a basic CSP - adjust based on your third-party integrations
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  
  // Extract hostname and port from API URL for CSP
  let apiHost = '';
  try {
    const apiUrlObj = new URL(apiUrl);
    apiHost = `${apiUrlObj.protocol}//${apiUrlObj.host}`;
  } catch {
    // Fallback if URL parsing fails
    apiHost = apiUrl.replace(/\/api.*$/, '').replace(/\/$/, '');
  }

  // Allow localhost and 127.0.0.1 for development
  const connectSrc = [
    "'self'",
    apiHost,
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com',
  ].filter(Boolean).join(' ');

  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://maps.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https: http://localhost:8000 http://127.0.0.1:8000 https://res.cloudinary.com",
    `connect-src ${connectSrc}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-src 'self' https://www.google.com https://maps.google.com https://www.google.com/maps https://maps.googleapis.com",
    "object-src 'none'",
    // Only enforce upgrade-insecure-requests in production
    ...(isProduction ? ['upgrade-insecure-requests'] : []),
  ].join('; ');

  response.headers.set('Content-Security-Policy', cspDirectives);

  // X-DNS-Prefetch-Control
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - .well-known (well-known files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|\\.well-known).*)',
  ],
};
