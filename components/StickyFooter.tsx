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
    phone: '+91 8790900881',
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
      const coursesRes = await fetch(`${apiUrl}/courses`);
      if (!coursesRes.ok) return;

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
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  }

  // Helper function to fetch form details
  async function fetchFormDetails(apiUrl: string): Promise<void> {
    try {
      const formRes = await fetch(`${apiUrl}/form-details`, { cache: 'no-store' });
      if (!formRes.ok) return;

      const rawPayload = await formRes.json();
      let payload = rawPayload;

      // Handle array or single object response
      if (Array.isArray(rawPayload)) {
        payload = rawPayload.at(-1);
      } else if (rawPayload?.success && rawPayload?.data) {
        payload = Array.isArray(rawPayload.data) ? rawPayload.data.at(-1) : rawPayload.data;
      }

      setFormDetails(payload);
    } catch (err) {
      console.error('Error fetching form details:', err);
    }
  }

  // Helper function to fetch contact details
  async function fetchContactDetails(apiUrl: string): Promise<void> {
    try {
      const footerRes = await fetch(`${apiUrl}/footer-settings`, { cache: 'no-store' });
      if (!footerRes.ok) return;

      const footerResponse = await footerRes.json();
      const footerData = footerResponse?.data || footerResponse;

      if (footerData?.contact_details) {
        setContactDetails({
          phone: footerData.contact_details.phone || '+91 9182617094',
          email: footerData.contact_details.email || 'support@skillvedika.com',
        });
      }
    } catch (err) {
      console.error('Error fetching contact details:', err);
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

  return (
    <div
      className={`
        fixed left-0 w-full z-50
        transition-all duration-500 ease-in-out
        ${show ? 'bottom-0' : '-bottom-24'}
      `}
    >
      <div className="bg-gray-100 border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-700">
          {/* Contact Numbers */}
          <div className="flex items-center gap-3 flex-wrap">
            <span>
              <b>For Assistance contact:</b>
            </span>

            {contactDetails.phone && (
              <a
                href={`tel:${contactDetails.phone.replaceAll(/\s+/g, '')}`}
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
      {isModalOpen && (
        <EnrollModal
          courses={courses}
          formDetails={formDetails}
          page="Sticky Footer"
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
