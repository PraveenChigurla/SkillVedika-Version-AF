/**
 * Google Analytics 4 (GA4) Component
 *
 * Performance-safe, non-blocking GA4 implementation using lazyOnload strategy.
 * Only loads on client-side and excludes admin routes.
 * Uses lazyOnload to prevent render-blocking and improve Lighthouse scores.
 *
 * Usage: Add <GoogleAnalytics /> to root layout
 */

'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || 'G-H5Y9D9E2T3';

/**
 * Check if current route should be tracked
 * Excludes admin and internal routes
 */
function shouldTrackRoute(pathname: string): boolean {
  const excludedPaths = [
    '/admin',
    '/dashboard',
    '/api',
    '/_next',
    '/auth',
    '/login',
    '/logout',
    '/test',
    '/internal',
  ];

  return !excludedPaths.some(excluded => pathname.startsWith(excluded));
}

/**
 * Track page view in GA4
 */
function trackPageView(path: string): void {
  if (!GA4_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) {
    return;
  }

  if (!shouldTrackRoute(path)) {
    return; // Don't track admin routes
  }

  window.gtag('config', GA4_MEASUREMENT_ID, {
    page_path: path,
  });
}

/**
 * Google Analytics Component
 *
 * Loads GA4 script and tracks page views on route changes.
 * Only tracks public routes (excludes admin).
 */
export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views on route changes
  useEffect(() => {
    if (!GA4_MEASUREMENT_ID) {
      return; // GA4 not configured
    }

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    if (shouldTrackRoute(pathname)) {
      trackPageView(url);
    }
  }, [pathname, searchParams]);

  // Don't render if GA4 ID is not configured
  if (!GA4_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      {/* Google Analytics Script - Load with lazyOnload strategy to avoid render-blocking */}
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA4_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              send_page_view: false // We'll track manually on route changes
            });
          `,
        }}
      />
    </>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}
