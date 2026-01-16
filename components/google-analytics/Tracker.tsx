'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const GA4_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || 'G-H5Y9D9E2T3';

const EXCLUDED_PATHS = [
  '/admin',
  '/dashboard',
  '/api',
  '/_next',
  '/auth',
  '/login',
  '/logout',
  '/internal',
];

function shouldTrack(pathname: string) {
  return !EXCLUDED_PATHS.some(path => pathname.startsWith(path));
}

export default function GoogleAnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (
      !GA4_MEASUREMENT_ID ||
      typeof window === 'undefined' ||
      !window.gtag ||
      !shouldTrack(pathname)
    ) {
      return;
    }

    const url =
      pathname +
      (searchParams?.toString()
        ? `?${searchParams.toString()}`
        : '');

    window.gtag('config', GA4_MEASUREMENT_ID, {
      page_path: url,
    });
  }, [pathname, searchParams]);

  return null;
}

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}
