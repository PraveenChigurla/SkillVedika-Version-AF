'use client';

import dynamic from 'next/dynamic';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

/* =========================
   Lazy-loaded client widgets
========================= */

// Cookie Consent
const CookieConsentWrapper = dynamic(
  () =>
    import('@/components/CookieConsentWrapper').catch(err => {
      console.warn('Failed to load CookieConsentWrapper:', err);
      return { default: () => null };
    }),
  { ssr: false }
);

// Sticky footer
const StickyFooter = dynamic(() => import('@/components/StickyFooter'), {
  ssr: false,
});

// Mobile unified FAB
const UnifiedHelpButton = dynamic(() => import('@/components/UnifiedHelpButton'), {
  ssr: false,
});

// Desktop WhatsApp button
const WhatsAppButton = dynamic(
  () =>
    import('@/components/WhatsAppButton').catch(err => {
      console.warn('Failed to load WhatsAppButton:', err);
      return { default: () => null };
    }),
  { ssr: false }
);

/**
 * Client Components Wrapper
 * - Holds all client-only UI
 * - Wraps reCAPTCHA v3 provider (global, once)
 */
export default function ClientComponents({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
      }}
    >
      {/* Optional: future client providers */}
      {children}

      {/* UI Widgets */}
      <StickyFooter />

      {/* Mobile */}
      <UnifiedHelpButton />

      {/* Desktop */}
      <div className="hidden sm:block">
        <WhatsAppButton />
      </div>

      <CookieConsentWrapper />
    </GoogleReCaptchaProvider>
  );
}
