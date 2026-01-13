'use client';

import { FaWhatsapp } from 'react-icons/fa';
import { useEffect, useState, useCallback, memo } from 'react';
import { getApiBaseUrl } from '@/lib/apiConfig';

// Performance: Memoize WhatsApp button to prevent unnecessary re-renders
function WhatsAppButton() {
  const [whatsappUrl, setWhatsappUrl] = useState('https://wa.me/919182617094?text=Hi%2C%20I%20need%20more%20information%20about%20the%20courses.'); // Default fallback
  const message = 'Hi, I need more information about the courses.';

  // Helper function to format WhatsApp URL from various input formats
  const formatWhatsAppUrl = useCallback((whatsappLink: string): string => {
    if (!whatsappLink || whatsappLink === '#') {
      return '';
    }

    // If it's already a full WhatsApp URL, use it directly
    if (whatsappLink.startsWith('https://wa.me/') || whatsappLink.startsWith('http://wa.me/')) {
      // Check if it already has a text parameter
      if (whatsappLink.includes('?text=')) {
        return whatsappLink;
      }
      // Add text parameter if missing
      return `${whatsappLink}${whatsappLink.includes('?') ? '&' : '?'}text=${encodeURIComponent(message)}`;
    }

    // If it's a phone number (with or without +, spaces, etc.), format it
    const phoneNumber = whatsappLink
      .replaceAll('+', '')
      .replaceAll(/\s+/g, '')
      .replaceAll(/\D/g, '');

    if (phoneNumber) {
      return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    }

    return '';
  }, [message]);

  // Performance: useCallback to memoize fetch function
  // Fetch from footer settings (same source as footer component)
  const fetchWhatsAppLink = useCallback(async () => {
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
      
      // Fetch from footer settings endpoint (same as footer component uses)
      const footerRes = await fetch(`${apiBaseUrl}/footer-settings`, {
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
      
      if (footerRes.ok) {
        const footerResponse = await footerRes.json();
        // Handle response format: {success: true, data: {...}} or direct object
        const footerData = footerResponse?.data || footerResponse;

        if (process.env.NODE_ENV === 'development') {
          console.log('[WhatsAppButton] Footer data received:', {
            hasSocialLinks: !!footerData?.social_links,
            whatsappValue: footerData?.social_links?.whatsapp,
            fullSocialLinks: footerData?.social_links,
          });
        }

        // Use WhatsApp link from social_links (separate field in admin)
        if (footerData?.social_links?.whatsapp) {
          const whatsappLink = footerData.social_links.whatsapp;
          const formattedUrl = formatWhatsAppUrl(whatsappLink);
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[WhatsAppButton] Formatting WhatsApp link:', {
              original: whatsappLink,
              formatted: formattedUrl,
            });
          }
          
          if (formattedUrl) {
            setWhatsappUrl(formattedUrl);
          } else if (process.env.NODE_ENV === 'development') {
            console.warn('[WhatsAppButton] Formatted URL is empty, keeping default');
          }
        } else if (process.env.NODE_ENV === 'development') {
          console.warn('[WhatsAppButton] No WhatsApp link found in social_links:', footerData?.social_links);
        }
      } else if (process.env.NODE_ENV === 'development') {
        console.warn(`[WhatsAppButton] Failed to fetch footer settings: HTTP ${footerRes.status}`);
      }
    } catch (err: any) {
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
        if (err.name === 'AbortError') {
          console.warn('[WhatsAppButton] Footer settings request timed out');
        } else {
          console.error('[WhatsAppButton] Error fetching footer settings:', err.message || err);
        }
      }
      // Don't break the UI - keep default WhatsApp URL
    }
  }, [formatWhatsAppUrl]);

  // Fetch WhatsApp link on mount
  useEffect(() => {
    // Fetch immediately to ensure fresh data
    fetchWhatsAppLink();
    
    // Also set up a periodic refresh to catch admin updates (every 30 seconds)
    const refreshInterval = setInterval(() => {
      fetchWhatsAppLink();
    }, 30000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, [fetchWhatsAppLink]);

  return (
    <>
      {/* Performance: Preconnect to WhatsApp for faster navigation */}
      {/* <link rel="preconnect" href="https://wa.me" /> */}
      
      <aside 
        className="hidden md:block fixed right-4 sm:right-15 bottom-13 z-50 safe-area-inset-bottom"
        aria-label="WhatsApp contact" 
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
      >
        {/* WhatsApp Button */}
        <div className="group relative">
          {/* Tooltip */}
          <div
            className="
              absolute right-full mr-3 top-1/2 -translate-y-1/2
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
              w-12 h-12
              flex items-center justify-center
              transition-all hover:scale-110 active:scale-95
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
              cursor-pointer
            "
            aria-label="Chat with us on WhatsApp"
          >
            <FaWhatsapp className="w-6 h-6 text-white" aria-hidden="true" />
          </a>
        </div>
      </aside>
    </>
  );
}

// Named export for better compatibility with dynamic imports
export { WhatsAppButton };

// Default export with memoization
export default memo(WhatsAppButton);
