/**
 * Lazy-loaded PhoneInput component with deferred CSS loading
 * This prevents react-phone-input-2 CSS from blocking the critical path
 */
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import PhoneInput - only loads when component is actually used
const PhoneInputComponent = dynamic(() => import('react-phone-input-2'), {
  ssr: false,
  loading: () => <div className="w-full h-12 bg-gray-100 rounded-md animate-pulse" />,
});

// Lazy load CSS only when component is about to be used
let cssLoaded = false;
const loadPhoneInputCSS = () => {
  if (cssLoaded || typeof window === 'undefined') return;

  // Check if CSS is already loaded
  const existingLink = document.querySelector('link[href*="react-phone-input-2"]');
  if (existingLink) {
    cssLoaded = true;
    return;
  }

  // Load CSS dynamically
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/_next/static/css/react-phone-input-2.css';
  link.media = 'print';
  link.onload = () => {
    link.media = 'all';
    cssLoaded = true;
  };
  document.head.appendChild(link);
};

export default function LazyPhoneInput(props: any) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Defer loading until component is in viewport or user interaction
    // Use requestIdleCallback to avoid blocking main thread
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(
          () => {
            loadPhoneInputCSS();
            setShouldLoad(true);
          },
          { timeout: 500 }
        );
      } else {
        setTimeout(() => {
          loadPhoneInputCSS();
          setShouldLoad(true);
        }, 100);
      }
    }
  }, []);

  if (!shouldLoad) {
    return <div className="w-full h-12 bg-gray-100 rounded-md animate-pulse" />;
  }

  return <PhoneInputComponent {...props} />;
}
