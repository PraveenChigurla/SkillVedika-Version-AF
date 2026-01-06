'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { FaWhatsapp, FaPhone, FaHeadset } from 'react-icons/fa';
import { MessageSquare, X } from 'lucide-react';
import { EnrollModal } from './EmptyLoginForm';
import { getApiBaseUrl } from '@/lib/apiConfig';

type Course = { id: number; title: string };

function UnifiedHelpButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('919182617094');
  const [contactPhone, setContactPhone] = useState('+91 9182617094');
  const [courses, setCourses] = useState<Course[]>([]);
  const [formDetails, setFormDetails] = useState<any>(null);
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [hideButton, setHideButton] = useState(false);

  const message = 'Hi, I need more information about the courses.';

  // Fetch contact details
  const fetchContactDetails = useCallback(async () => {
    try {
      const apiBaseUrl = getApiBaseUrl();
      if (!apiBaseUrl) return;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const contactRes = await fetch(`${apiBaseUrl}/contact-page`, {
        signal: controller.signal,
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      }).catch((fetchError) => {
        if (fetchError instanceof TypeError && fetchError.message === 'Failed to fetch') {
          throw new Error('Network error: Unable to reach the API server');
        }
        throw fetchError;
      });

      clearTimeout(timeoutId);

      if (contactRes.ok) {
        const contactResponse = await contactRes.json();
        const contactData = contactResponse?.data || contactResponse;

        if (contactData?.contacts_phone_number) {
          const formattedPhone = contactData.contacts_phone_number
            .replaceAll('+', '')
            .replaceAll(/\s+/g, '')
            .replaceAll(/\D/g, '');

          if (formattedPhone) {
            setPhoneNumber(formattedPhone);
          }
          setContactPhone(contactData.contacts_phone_number);
        }
      }
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        if (err.name === 'AbortError') {
          console.warn('[UnifiedHelpButton] Contact details request timed out');
        } else {
          console.error('[UnifiedHelpButton] Error fetching contact details:', err.message || err);
        }
      }
    }
  }, []);

  // Fetch courses
  useEffect(() => {
    async function fetchCourses() {
      try {
        const { getApiUrl } = await import('@/lib/apiConfig');
        const apiUrl = getApiUrl('/courses');
        if (!apiUrl) return;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(apiUrl, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        }).catch((fetchError) => {
          if (fetchError instanceof TypeError && fetchError.message === 'Failed to fetch') {
            throw new Error('Network error: Unable to reach the API server');
          }
          throw fetchError;
        });

        clearTimeout(timeoutId);

        if (!res.ok) return;

        const response = await res.json();
        let coursesData: any[] = [];
        if (Array.isArray(response)) {
          coursesData = response;
        } else if (response?.data && Array.isArray(response.data)) {
          coursesData = response.data;
        } else if (response?.courses && Array.isArray(response.courses)) {
          coursesData = response.courses;
        }

        const courseList = coursesData
          .map((course: any) => ({
            id: course.id || course.course_id || 0,
            title: course.title || course.course_name || '',
          }))
          .filter((c: any) => c.id && c.title);

        setCourses(courseList);
      } catch (err: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[UnifiedHelpButton] Error fetching courses:', err.message || err);
        }
      }
    }

    fetchCourses();
  }, []);

  // Fetch form details
  useEffect(() => {
    async function fetchFormDetails() {
      try {
        const { getApiUrl } = await import('@/lib/apiConfig');
        const apiUrl = getApiUrl('/form-details');
        if (!apiUrl) return;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(apiUrl, {
          signal: controller.signal,
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        }).catch((fetchError) => {
          if (fetchError instanceof TypeError && fetchError.message === 'Failed to fetch') {
            throw new Error('Network error: Unable to reach the API server');
          }
          throw fetchError;
        });

        clearTimeout(timeoutId);

        if (!res.ok) return;

        const rawPayload = await res.json();
        let payload = rawPayload;

        if (Array.isArray(rawPayload)) {
          payload = rawPayload.at(-1);
        } else if (rawPayload?.success && rawPayload?.data) {
          payload = Array.isArray(rawPayload.data) ? rawPayload.data.at(-1) : rawPayload.data;
        }

        setFormDetails(payload);
      } catch (err: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[UnifiedHelpButton] Error fetching form details:', err.message || err);
        }
      }
    }

    fetchFormDetails();
  }, []);

  // Defer contact details fetch
  useEffect(() => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(fetchContactDetails, { timeout: 2000 });
    } else {
      setTimeout(fetchContactDetails, 500);
    }
  }, [fetchContactDetails]);

  // Hide button when near footer
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const clientHeight = window.innerHeight;
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
      
      // Hide if within 200px of footer
      setHideButton(distanceFromBottom < 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when bottom sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  const phoneForCall = contactPhone.replaceAll(/\s+/g, '').replaceAll(/[^\d+]/g, '');

  return (
    <>
      {/* Mobile: Unified FAB - Hidden near footer */}
      <div
        className={`
          sm:hidden fixed right-4 bottom-4 z-50
          transition-all duration-300
          ${hideButton ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100'}
          safe-area-inset-bottom
        `}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
      >
        <button
          onClick={() => setIsOpen(true)}
          className="
            bg-gradient-to-r from-[#1E5BA8] to-[#2563EB]
            text-white
            rounded-full shadow-2xl
            px-5 py-4
            flex items-center gap-2.5
            hover:from-[#1A3F66] hover:to-[#1E40AF]
            active:scale-95
            transition-all duration-300
            focus:outline-none focus:ring-2 focus:ring-[#1E5BA8] focus:ring-offset-2
            font-semibold text-sm
          "
          aria-label="Need help? Talk to expert"
        >
          <FaHeadset className="w-5 h-5" />
          <span>Need Help?</span>
        </button>
      </div>

      {/* Bottom Sheet Overlay */}
      {isOpen && (
        <div
          className="sm:hidden fixed inset-0 bg-black/50 z-[60] transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Bottom Sheet - Compact size */}
      <div
        className={`
          sm:hidden fixed left-0 right-0 bottom-0 z-[60]
          bg-white rounded-t-3xl shadow-2xl
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
          max-h-[45vh]
          flex flex-col
          safe-area-inset-bottom
        `}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
        role="dialog"
        aria-modal="true"
        aria-label="Help options"
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-2 pb-1.5 flex-shrink-0">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header - Compact */}
        <div className="px-4 pb-3 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Need Help?</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Options - Compact */}
        <div className="px-4 py-3 space-y-2 overflow-y-auto flex-1">
          {/* WhatsApp Option - Compact */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="
              flex items-center gap-3 p-3
              bg-green-50 hover:bg-green-100 active:bg-green-200
              rounded-xl border border-green-200
              transition-all duration-200
              group
            "
          >
            <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <FaWhatsapp className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-gray-900 group-hover:text-green-700">WhatsApp Chat</h4>
              <p className="text-xs text-gray-600">Get instant responses</p>
            </div>
          </a>

          {/* Enquiry Form Option - Compact */}
          <button
            onClick={() => {
              setIsOpen(false);
              setShowEnquiryForm(true);
            }}
            className="
              w-full flex items-center gap-3 p-3
              bg-blue-50 hover:bg-blue-100 active:bg-blue-200
              rounded-xl border border-blue-200
              transition-all duration-200
              text-left
              group
            "
          >
            <div className="flex-shrink-0 w-10 h-10 bg-[#1E5BA8] rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-gray-900 group-hover:text-[#1E5BA8]">Get Callback</h4>
              <p className="text-xs text-gray-600">Fill form & we'll call you</p>
            </div>
          </button>

          {/* Call Option - Compact */}
          {phoneForCall && (
            <a
              href={`tel:${phoneForCall}`}
              onClick={() => setIsOpen(false)}
              className="
                flex items-center gap-3 p-3
                bg-gray-50 hover:bg-gray-100 active:bg-gray-200
                rounded-xl border border-gray-200
                transition-all duration-200
                group
              "
            >
              <div className="flex-shrink-0 w-10 h-10 bg-[#1E5BA8] rounded-full flex items-center justify-center">
                <FaPhone className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-gray-900 group-hover:text-[#1E5BA8]">Call Us</h4>
                <p className="text-xs text-gray-600 truncate">{contactPhone}</p>
              </div>
            </a>
          )}
        </div>
      </div>

      {/* Enquiry Form Modal */}
      {showEnquiryForm && (
        <EnrollModal
          courses={courses}
          formDetails={formDetails}
          onClose={() => setShowEnquiryForm(false)}
          page="Unified Help Button"
        />
      )}
    </>
  );
}

export default memo(UnifiedHelpButton);

