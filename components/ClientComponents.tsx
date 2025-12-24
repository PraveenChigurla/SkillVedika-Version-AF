'use client';

import dynamic from 'next/dynamic';

// Performance: Lazy load CookieConsent - not critical for initial render
// Wrap in try-catch to handle chunk load errors gracefully
const CookieConsentWrapper = dynamic(
  () =>
    import('@/components/CookieConsentWrapper').catch(err => {
      console.warn('Failed to load CookieConsentWrapper:', err);
      return { default: () => null };
    }),
  {
    loading: () => null, // Don't show loading state
    ssr: false, // Cookie consent is client-only
  }
);

// Performance: Lazy load StickyFooter - appears after scroll
const StickyFooter = dynamic(() => import('@/components/StickyFooter'), {
  ssr: false, // Client-only component
  loading: () => null,
});

// Performance: Lazy load WhatsAppButton - not critical for initial render
const WhatsAppButton = dynamic(() => import('@/components/WhatsAppButton'), {
  ssr: false, // Client-only component
  loading: () => null,
});

// Performance: Lazy load QueryPopup - appears after interaction
const QueryPopup = dynamic(() => import('@/components/QueryPopup'), {
  ssr: false, // Client-only component
  loading: () => null,
});

/**
 * Client Components Wrapper
 * 
 * This component wraps all client-only components that need ssr: false.
 * It's a client component itself, so it can use ssr: false in dynamic imports.
 */
export default function ClientComponents() {
  return (
    <>
      <StickyFooter />
      <WhatsAppButton />
      <QueryPopup />
      <CookieConsentWrapper />
    </>
  );
}

