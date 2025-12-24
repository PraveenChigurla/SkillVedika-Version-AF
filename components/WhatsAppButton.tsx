'use client';

import { FaWhatsapp } from 'react-icons/fa';
import { useEffect, useState } from 'react';

export default function WhatsAppButton() {
  const [phoneNumber, setPhoneNumber] = useState('919182617094'); // Default fallback
  const message = 'Hi, I need more information about the courses.';

  // Fetch contact details from footer settings
  useEffect(() => {
    async function fetchContactDetails() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          return;
        }

        const footerRes = await fetch(`${apiUrl}/footer-settings`, { cache: 'no-store' });
        if (footerRes.ok) {
          const footerResponse = await footerRes.json();
          const footerData = footerResponse?.data || footerResponse;

          if (footerData?.contact_details?.phone) {
            // Format phone number for WhatsApp: remove +, spaces, and any non-digit characters
            const formattedPhone = footerData.contact_details.phone
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
    }

    fetchContactDetails();
  }, []);

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-16 right-6 z-50 group">
      {/* Tooltip */}
      <div
        className="
          absolute right-16 top-1/2 -translate-y-1/2
          bg-black text-white text-xs
          px-3 py-1 rounded-md
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          whitespace-nowrap
        "
      >
        Chat with us
      </div>

      {/* Pulse Ring */}
      {/* <span
        className="
          absolute inset-0 rounded-full
          bg-green-500 opacity-75
          animate-ping duration-5000
        "
      /> */}

      {/* WhatsApp Button */}
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
        "
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp className="w-8 h-8 text-white" />
      </a>
    </div>
  );
}
