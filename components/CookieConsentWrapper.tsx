'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Lazy load CookieConsent - only load after page is interactive to reduce TBT
// Add error handling for chunk load failures
const CookieConsent = dynamic(() => import('@/components/CookieConsent').catch(() => {
  console.warn('Failed to load CookieConsent component');
  return { default: () => null };
}), {
  ssr: false,
  loading: () => null, // Don't show loading state
});

export default function CookieConsentWrapper() {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Defer loading until after initial render to reduce TBT
  useEffect(() => {
    // Use requestIdleCallback if available, otherwise setTimeout
    if (typeof window !== 'undefined') {
      const loadComponent = () => {
        try {
          setShouldLoad(true);
        } catch (error) {
          console.warn('Error loading CookieConsent:', error);
          setLoadError(true);
        }
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(loadComponent, { timeout: 2000 });
      } else {
        setTimeout(loadComponent, 1000);
      }
    }
  }, []);

  // If there's an error or component shouldn't load, return null
  if (loadError || !shouldLoad) return null;

  try {
    return <CookieConsent />;
  } catch (error) {
    console.warn('Error rendering CookieConsent:', error);
    return null;
  }
}
