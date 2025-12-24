'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user has already accepted cookies
    const hasConsented = localStorage.getItem('cookieConsent');
    if (!hasConsented) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
  };

  if (!mounted || !isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-start justify-between gap-4 sm:flex-row flex-col">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">Cookie & Privacy Notice</h3>
          <p className="text-sm text-gray-600 mb-3">
            We use cookies to enhance your experience, including cookies from third-party services
            like Google Maps. By continuing to use our site, you consent to our use of cookies.
            Please see our{' '}
            <a href="/terms" className="text-blue-600 hover:underline">
              terms and privacy policy
            </a>{' '}
            for more details.
          </p>
        </div>

        <div className="flex gap-3 shrink-0 sm:flex-row flex-row items-center">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
          >
            Accept & Continue
          </button>
          <button
            onClick={handleDecline}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
