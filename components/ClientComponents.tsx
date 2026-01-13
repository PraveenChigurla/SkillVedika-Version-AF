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

// Performance: Lazy load UnifiedHelpButton - mobile-first unified FAB
const UnifiedHelpButton = dynamic(() => import('@/components/UnifiedHelpButton'), {
  ssr: false, // Client-only component
  loading: () => null,
});

// Performance: Lazy load WhatsAppButton - desktop only
const WhatsAppButton = dynamic(
  () => import('@/components/WhatsAppButton').catch(err => {
    console.warn('Failed to load WhatsAppButton:', err);
    return { default: () => null };
  }),
  {
  ssr: false, // Client-only component
  loading: () => null,
  }
);

// QueryPopup functionality is now integrated into WhatsAppButton
// Keeping import commented out to avoid conflicts
// const QueryPopup = dynamic(
//   () => import('@/components/QueryPopup').catch(err => {
//     console.warn('Failed to load QueryPopup:', err);
//     return { default: () => null };
//   }),
//   {
//     ssr: false,
//     loading: () => null,
//   }
// );

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
      {/* Mobile: Unified Help Button */}
      <UnifiedHelpButton />
      {/* Desktop: Separate buttons */}
      <div className="hidden sm:block">
      <WhatsAppButton />
      </div>
      <CookieConsentWrapper />
    </>
  );
}

