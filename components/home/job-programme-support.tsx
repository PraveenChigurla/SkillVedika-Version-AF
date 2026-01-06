'use client';

import parse from 'html-react-parser';
import { useState, useEffect } from 'react';
import { EnrollModal } from '../EmptyLoginForm';
import { getApiUrl } from '@/lib/apiConfig';
import { logger } from '@/lib/logger';
import type { Course } from '@/types/api';

interface JobProgrammeSupportProps {
  readonly jobSupport?: {
    readonly job_support_payment_types?: readonly string[];
    readonly job_support_title?: string;
    readonly job_support_content?: string;
    readonly job_support_button?: string;
  };
}

export default function JobProgrammeSupport({ jobSupport }: JobProgrammeSupportProps) {
  const paymentTypes = jobSupport?.job_support_payment_types || [];
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [courses, setCourses] = useState<Array<{ id: number; title: string }>>([]);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const apiUrl = getApiUrl('/courses');

        const res = await fetch(apiUrl, {
          headers: {
            Accept: 'application/json',
          },
        });

        if (!res.ok) {
          logger.error('Failed to fetch courses:', res.status);
          return;
        }

        const data = await res.json();
        // Handle different API response formats
        let coursesArray: Course[] = [];
        if (Array.isArray(data)) {
          coursesArray = data as Course[];
        } else if (data?.data && Array.isArray(data.data)) {
          coursesArray = data.data as Course[];
        } else if (data?.courses && Array.isArray(data.courses)) {
          coursesArray = data.courses as Course[];
        }

        // Map API response to { id, title } format expected by modal
        const courseList = coursesArray.map((course: Course) => ({
          id: course.id || course.course_id || 0,
          title: course.title || course.course_name || '',
        }));

        setCourses(courseList);
      } catch (err) {
        logger.error('Error fetching courses:', err);
        setCourses([]); // Set empty array on error
      }
    }

    fetchCourses();
  }, []);

  return (
    <section
      className="relative py-12 sm:py-16 md:py-20 lg:py-24 bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage: "url('/home/handshake.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* ⭐ Dynamic Title (safe wrapper) */}
        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 px-2">
          {jobSupport?.job_support_title
            ? parse(jobSupport.job_support_title)
            : 'Job Programme Support'}
        </div>

        {/* ⭐ Dynamic Content (safe wrapper) */}
        <div className="text-gray-100 text-sm sm:text-base mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
          {jobSupport?.job_support_content ? parse(jobSupport.job_support_content) : null}
        </div>

        {/* ⭐ Dynamic Payment Type Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-6 px-2">
          {paymentTypes.map((type: string, index: number) => (
            <button
              key={`payment-type-${type}-${index}`}
              className="bg-white text-[#2C5AA0] px-6 sm:px-8 py-2 sm:py-2.5 rounded font-semibold hover:bg-gray-100 active:bg-gray-200 transition-colors capitalize text-sm sm:text-base min-h-[44px]"
            >
              {type}
            </button>
          ))}
        </div>

        {/* ⭐ Dynamic Main Button */}
        <button
          onClick={() => setShowEnrollModal(true)}
          className="inline-block bg-[#2C5AA0] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded font-semibold hover:bg-[#1A3F66] active:bg-[#153355] transition-colors text-sm sm:text-base min-h-[44px]"
        >
          {jobSupport?.job_support_button || 'Get Started'}
        </button>

        {showEnrollModal && (
          <EnrollModal
            courses={courses}
            page="Home page"
            onClose={() => setShowEnrollModal(false)}
          />
        )}
      </div>
    </section>
  );
}
