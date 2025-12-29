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
      
      // Fetch from contact page endpoint (same as contact page uses)
      const contactRes = await fetch(`${apiBaseUrl}/contact-page`, { 
        cache: 'no-store', // Client-side fetch - use no-store for fresh data
      });
      
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
      }
    } catch (err) {
      console.error('Error fetching contact details for WhatsApp:', err);
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
      <link rel="preconnect" href="https://wa.me" />
      
      <div className="fixed bottom-16 right-6 z-50 group" role="complementary" aria-label="WhatsApp contact">
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
            bg-green-500 hover:bg-green-600
            rounded-full shadow-xl
            w-11 h-11
            flex items-center justify-center
            transition-transform hover:scale-110
            focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
          "
          aria-label="Chat with us on WhatsApp"
        >
          <FaWhatsapp className="w-8 h-8 text-white" aria-hidden="true" />
        </a>
      </div>
    </>
  );
}

// Performance: Export memoized component
export default memo(WhatsAppButton);
