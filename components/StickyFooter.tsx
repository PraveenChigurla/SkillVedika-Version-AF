'use client';

import { useEffect, useState } from 'react';
import { EnrollModal } from './EmptyLoginForm';

type Course = { id: number; title: string };

export default function StickyFooter() {
  const [show, setShow] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [formDetails, setFormDetails] = useState<any>(null);
  const [contactDetails, setContactDetails] = useState<{ phone?: string; email?: string }>({
    phone: '+91 8790536265',
    email: 'support@skillvedika.com',
  });

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > 300);
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Helper function to fetch courses
  async function fetchCourses(apiUrl: string): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const coursesRes = await fetch(`${apiUrl}/courses`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      }).catch((fetchError) => {
        if (fetchError instanceof TypeError && fetchError.message === 'Failed to fetch') {
          throw new Error('Network error: Unable to reach the API server');
        }
        throw fetchError;
      });

      clearTimeout(timeoutId);

      if (!coursesRes.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[StickyFooter] Failed to fetch courses: HTTP ${coursesRes.status}`);
        }
        return;
      }

      const coursesResponse = await coursesRes.json();
      // Handle different API response formats: {success: true, data: [...]} or direct array
      let coursesData: any[] = [];
      if (Array.isArray(coursesResponse)) {
        coursesData = coursesResponse;
      } else if (coursesResponse?.data && Array.isArray(coursesResponse.data)) {
        coursesData = coursesResponse.data;
      } else if (coursesResponse?.courses && Array.isArray(coursesResponse.courses)) {
        coursesData = coursesResponse.courses;
      }

      const courseList = coursesData
        .map((course: any) => ({
          id: course.id || course.course_id || 0,
          title: course.title || course.course_name || '',
        }))
        .filter((c: any) => c.id && c.title); // Filter out invalid courses

      setCourses(courseList);
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        if (err.name === 'AbortError') {
          console.warn('[StickyFooter] Courses request timed out');
        } else {
          console.error('[StickyFooter] Error fetching courses:', err.message || err);
        }
      }
      // Don't break the UI - keep existing courses or empty array
    }
  }

  // Helper function to fetch form details
  async function fetchFormDetails(apiUrl: string): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const formRes = await fetch(`${apiUrl}/form-details`, {
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

      if (!formRes.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[StickyFooter] Failed to fetch form details: HTTP ${formRes.status}`);
        }
        return;
      }

      const rawPayload = await formRes.json();
      let payload = rawPayload;

      // Handle array or single object response
      if (Array.isArray(rawPayload)) {
        payload = rawPayload.at(-1);
      } else if (rawPayload?.success && rawPayload?.data) {
        payload = Array.isArray(rawPayload.data) ? rawPayload.data.at(-1) : rawPayload.data;
      }

      setFormDetails(payload);
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        if (err.name === 'AbortError') {
          console.warn('[StickyFooter] Form details request timed out');
        } else {
          console.error('[StickyFooter] Error fetching form details:', err.message || err);
        }
      }
      // Don't break the UI - keep existing form details or null
    }
  }

  // Helper function to fetch contact details from contact page (same source as contact page)
  async function fetchContactDetails(apiUrl: string): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const contactRes = await fetch(`${apiUrl}/contact-page`, {
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

      if (!contactRes.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[StickyFooter] Failed to fetch contact details: HTTP ${contactRes.status}`);
        }
        return;
      }

      const contactResponse = await contactRes.json();
      const contactData = contactResponse?.data || contactResponse;

      if (contactData) {
        setContactDetails({
          phone: contactData.contacts_phone_number || '+91 9182617094',
          email: contactData.contacts_email_id || 'support@skillvedika.com',
        });
      }
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        if (err.name === 'AbortError') {
          console.warn('[StickyFooter] Contact details request timed out');
        } else {
          console.error('[StickyFooter] Error fetching contact details:', err.message || err);
        }
      }
      // Don't break the UI - keep default contact details
    }
  }

  // Fetch courses, form details, and contact details
  useEffect(() => {
    async function fetchData() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        console.error('NEXT_PUBLIC_API_URL not set');
        return;
      }

      // Fetch all data in parallel
      await Promise.all([
        fetchCourses(apiUrl),
        fetchFormDetails(apiUrl),
        fetchContactDetails(apiUrl),
      ]);
    }

    fetchData();
  }, []);

  // Format phone number for tel: link (remove spaces and special chars, keep + and digits)
  const phoneForCall = contactDetails.phone
    ? contactDetails.phone.replaceAll(/\s+/g, '').replaceAll(/[^\d+]/g, '')
    : '';

  return (
    <>
      {/* Mobile-only Call Button - Hidden since we have "Call Us" in UnifiedHelpButton */}
      {/* Removed: Call option is now available in the "Need Help?" bottom sheet */}

      {/* Desktop Footer (hidden on mobile) */}
      <div
        className={`
          hidden md:block
          fixed left-0 w-full z-40
          transition-all duration-500 ease-in-out
          ${show ? 'bottom-0' : '-bottom-24'}
          safe-area-inset-bottom
        `}
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0)',
        }}
      >
        <div className="bg-gray-100 border-t border-gray-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-700">
            {/* Contact Numbers */}
            <div className="flex items-center gap-3 flex-wrap">
              <span>
                <b>For Assistance contact:</b>
              </span>

              {contactDetails.phone && (
                <a
                  href={`tel:${phoneForCall}`}
                  className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                >
                  <img
                    src="https://flagcdn.com/w20/in.png"
                    alt="India"
                    className="w-5 h-3.5 object-cover"
                  />
                  <b>{contactDetails.phone}</b>
                </a>
              )}
              {contactDetails.phone && contactDetails.email && (
                <span className="hidden sm:block">|</span>
              )}
              {contactDetails.email && (
                <a
                  href={`mailto:${contactDetails.email}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  <b>Email: {contactDetails.email}</b>
                </a>
              )}
            </div>

            {/* CTA Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-2 rounded-full transition"
            >
              Contact us for more information
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <EnrollModal
          courses={courses}
          formDetails={formDetails}
          page="Sticky Footer"
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
