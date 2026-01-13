'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

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
  return !EXCLUDED_PATHS.some(p => pathname.startsWith(p));
}

export default function GoogleAnalytics() {
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
      (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    window.gtag('config', GA4_MEASUREMENT_ID, {
      page_path: url,
    });
  }, [pathname, searchParams]);

  if (!GA4_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
      />

      <Script id="ga4-init" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA4_MEASUREMENT_ID}', {
            send_page_view: false
          });
        `}
      </Script>
    </>
  );
}

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}
