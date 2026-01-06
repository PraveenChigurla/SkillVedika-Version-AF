'use client';

import { useState, useEffect } from 'react';
import { EnrollModal } from './EmptyLoginForm';

type Course = { id: number; title: string };

interface QueryPopupProps {
  courses?: Course[];
  page?: string;
  formDetails?: any;
  onSubmit?: (data: {
    fullName: string;
    email: string;
    phone: string;
    selectedCourses: number[];
  }) => Promise<void>;
}
//popup
export default function QueryPopup({
  courses: propCourses,
  page = 'Popup',
  formDetails: propFormDetails,
  onSubmit,
}: QueryPopupProps) {
  const [open, setOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>(propCourses || []);
  const [formDetails, setFormDetails] = useState<any>(propFormDetails || null);

  // Fetch courses and form details if not provided as props
  useEffect(() => {
    // If courses are provided as props, use them
    if (propCourses && propCourses.length > 0) {
      setCourses(propCourses);
      return;
    }

    // Otherwise, fetch courses
    async function fetchCourses() {
      try {
        const { getApiUrl } = await import('@/lib/apiConfig');
        const apiUrl = getApiUrl('/courses');
        
        if (!apiUrl) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('[QueryPopup] API URL not configured');
          }
          return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(apiUrl, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        }).catch((fetchError) => {
          // Handle network errors
          if (fetchError instanceof TypeError && fetchError.message === 'Failed to fetch') {
            throw new Error('Network error: Unable to reach the API server');
          }
          throw fetchError;
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[QueryPopup] Failed to fetch courses: HTTP ${res.status}`);
          }
          return;
        }

        const response = await res.json();
        // Handle different API response formats: {success: true, data: [...]} or direct array
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
          .filter((c: any) => c.id && c.title); // Filter out invalid courses

        setCourses(courseList);
      } catch (err: any) {
        // Only log errors in development
        if (process.env.NODE_ENV === 'development') {
          if (err.name === 'AbortError') {
            console.warn('[QueryPopup] Courses request timed out');
          } else {
            console.error('[QueryPopup] Error fetching courses:', err.message || err);
          }
        }
        // Don't break the UI - just use empty array
        setCourses([]);
      }
    }

    fetchCourses();
  }, [propCourses]);

  // Fetch form details if not provided as props
  useEffect(() => {
    // If form details are provided as props, use them
    if (propFormDetails) {
      setFormDetails(propFormDetails);
      return;
    }

    // Otherwise, fetch form details
    async function fetchFormDetails() {
      try {
        const { getApiUrl } = await import('@/lib/apiConfig');
        const apiUrl = getApiUrl('/form-details');
        
        if (!apiUrl) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('[QueryPopup] API URL not configured');
          }
          return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(apiUrl, {
          signal: controller.signal,
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        }).catch((fetchError) => {
          // Handle network errors
          if (fetchError instanceof TypeError && fetchError.message === 'Failed to fetch') {
            throw new Error('Network error: Unable to reach the API server');
          }
          throw fetchError;
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[QueryPopup] Failed to fetch form-details: HTTP ${res.status}`);
          }
          return;
        }

        const rawPayload = await res.json();
        let payload = rawPayload;

        // Handle array or single object response
        if (Array.isArray(rawPayload)) {
          payload = rawPayload.at(-1);
        } else if (rawPayload?.success && rawPayload?.data) {
          payload = Array.isArray(rawPayload.data) ? rawPayload.data.at(-1) : rawPayload.data;
        }

        setFormDetails(payload);
      } catch (err: any) {
        // Only log errors in development
        if (process.env.NODE_ENV === 'development') {
          if (err.name === 'AbortError') {
            console.warn('[QueryPopup] Form details request timed out');
          } else {
            console.error('[QueryPopup] Error fetching form details:', err.message || err);
          }
        }
        // Don't break the UI - keep existing form details or null
      }
    }

    fetchFormDetails();
  }, [propFormDetails]);

  return (
    <>
      {/* Floating Icon Button - Desktop only */}
      <div className="hidden sm:block fixed right-4 sm:right-6 bottom-36 z-50 group safe-area-inset-bottom" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}>
        {/* Tooltip */}
        <div
          className="
            absolute right-16 top-1/2 -translate-y-1/2
            bg-black text-white text-xs
            px-3 py-1 rounded-md
            opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
            transition-opacity duration-300
            whitespace-nowrap
            pointer-events-none
            z-10
          "
          role="tooltip"
          aria-hidden="true"
        >
          Share your Interest
        </div>

        <button
          onClick={() => setOpen(true)}
          className="rounded-full p-3 hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-[#2C5AA0] focus:ring-offset-2"
          aria-label="Share your interest"
        >
          <img src="/fillform3.png" alt="Share your interest" className="w-12 h-12 sm:w-14 sm:h-14" />
        </button>
      </div>

      {/* EnrollModal - opens when button is clicked */}
      {open && (
        <EnrollModal
          courses={courses}
          formDetails={formDetails}
          onClose={() => setOpen(false)}
          page={page}
          onSubmit={onSubmit}
        />
      )}
    </>
  );
}
