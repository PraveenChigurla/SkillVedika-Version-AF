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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          console.error('NEXT_PUBLIC_API_URL not set');
          return;
        }

        const res = await fetch(`${apiUrl}/courses`);
        if (!res.ok) {
          console.error('Failed to fetch courses');
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
      } catch (err) {
        console.error('Error fetching courses in QueryPopup:', err);
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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        if (!apiUrl) {
          return;
        }

        const res = await fetch(`${apiUrl}/form-details`, { cache: 'no-store' });
        if (!res.ok) {
          console.warn(`Failed to fetch form-details: ${res.status}`);
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
      } catch (err) {
        console.warn('Failed to fetch form-details in QueryPopup:', err);
      }
    }

    fetchFormDetails();
  }, [propFormDetails]);

  return (
    <>
      {/* Floating Icon Button */}
      <div className="fixed right-1 bottom-28 right-2 z-10 group">
        {/* Tooltip */}
        <div
          className="
            absolute right-16 top-1/2 -translate-y-1/2
            bg-black text-white text-xs
            px-3 py-1 rounded-md
            opacity-0 group-hover:opacity-100
            transition-opacity duration-300
            whitespace-nowrap
            pointer-events-none
          "
        >
          Share your Interest
        </div>

        <button
          onClick={() => setOpen(true)}
          className="rounded-full p-3 hover:scale-105 transition"
        >
          <img src="/fillform3.png" alt="Open Query" className="w-14 h-14" />
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
