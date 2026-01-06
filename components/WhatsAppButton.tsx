'use client';

import { FaWhatsapp } from 'react-icons/fa';
import { useEffect, useState, useCallback, memo } from 'react';
import { getApiBaseUrl } from '@/lib/apiConfig';

// Performance: Memoize WhatsApp button to prevent unnecessary re-renders
function WhatsAppButton() {
  const [phoneNumber, setPhoneNumber] = useState('919182617094'); // Default fallback
  const message = 'Hi, I need more information about the courses.';

  // Performance: useCallback to memoize fetch function
  // Fetch from contact page (same source as contact page)
  const fetchContactDetails = useCallback(async () => {
    try {
      const apiBaseUrl = getApiBaseUrl();
      
      if (!apiBaseUrl) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[WhatsAppButton] API base URL not configured');
        }
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // Fetch from contact page endpoint (same as contact page uses)
      const contactRes = await fetch(`${apiBaseUrl}/contact-page`, {
        signal: controller.signal,
        cache: 'no-store', // Client-side fetch - use no-store for fresh data
        headers: { Accept: 'application/json' },
      }).catch((fetchError) => {
        // Handle network errors
        if (fetchError instanceof TypeError && fetchError.message === 'Failed to fetch') {
          throw new Error('Network error: Unable to reach the API server');
        }
        throw fetchError;
      });

      clearTimeout(timeoutId);
      
      if (contactRes.ok) {
        const contactResponse = await contactRes.json();
        // Handle response format: {data: {...}} or direct object
        const contactData = contactResponse?.data || contactResponse;

        if (contactData?.contacts_phone_number) {
          // Format phone number for WhatsApp: remove +, spaces, and any non-digit characters
          const formattedPhone = contactData.contacts_phone_number
            .replaceAll('+', '')
            .replaceAll(/\s+/g, '')
            .replaceAll(/\D/g, '');

          if (formattedPhone) {
            setPhoneNumber(formattedPhone);
          }
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[WhatsAppButton] Failed to fetch contact details: HTTP ${contactRes.status}`);
        }
      }
    } catch (err: any) {
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
        if (err.name === 'AbortError') {
          console.warn('[WhatsAppButton] Contact details request timed out');
        } else {
          console.error('[WhatsAppButton] Error fetching contact details:', err.message || err);
        }
      }
      // Don't break the UI - keep default phone number
    }
  }, []);

  // Performance: Defer contact details fetch - not critical for initial render
  useEffect(() => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(fetchContactDetails, { timeout: 2000 });
    } else {
      setTimeout(fetchContactDetails, 500);
    }
  }, [fetchContactDetails]);

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <>
      {/* Performance: Preconnect to WhatsApp for faster navigation */}
      {/* <link rel="preconnect" href="https://wa.me" /> */}
      
      <div 
        className="hidden sm:block fixed right-4 sm:right-6 bottom-24 z-50 group safe-area-inset-bottom"
        role="complementary" 
        aria-label="WhatsApp contact" 
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
      >
        {/* Accessibility: Tooltip with proper ARIA */}
        <div
          className="
            absolute right-16 top-1/2 -translate-y-1/2
            bg-black text-white text-xs
            px-3 py-1 rounded-md
            opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
            transition-opacity duration-300
            whitespace-nowrap
            pointer-events-none
          "
          role="tooltip"
          aria-hidden="true"
        >
          Chat with us
        </div>

        {/* Accessibility: Proper link with aria-label and keyboard support */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="
            relative
            bg-green-500 hover:bg-green-600 active:bg-green-700
            rounded-full shadow-xl
            w-11 h-11 sm:w-12 sm:h-12
            flex items-center justify-center
            transition-transform hover:scale-110 active:scale-95
            focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
          "
          aria-label="Chat with us on WhatsApp"
        >
          <FaWhatsapp className="w-6 h-6 sm:w-8 sm:h-8 text-white" aria-hidden="true" />
        </a>
      </div>
    </>
  );
}

// Performance: Export memoized component
export default memo(WhatsAppButton);
