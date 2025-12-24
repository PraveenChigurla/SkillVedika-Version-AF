'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { getTitleParts } from '@/utils/getTitle';
import React, { useState, useEffect } from 'react';
import { EnrollModal } from '../EmptyLoginForm';
import SafeHTML from '@/components/SafeHTML';
import { getApiUrl } from '@/lib/apiConfig';
import { logger } from '@/lib/logger';
import type { Course } from '@/types/api';

export interface HeroSectionProps {
  title: any;
  description: string | null;
  buttonText: string | null;
  buttonLink?: string | null;
  imagePath: string | null;
}

function HeroSection({
  title,
  description,
  buttonText,
  buttonLink,
  imagePath,
}: Readonly<HeroSectionProps>) {
  const IMAGE_SCALE = 0.72;
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [courses, setCourses] = useState<{ id: number; title: string }[]>([]);

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

  // Use the shared helper to safely build title parts
  const { part1, part2 } = getTitleParts(title);

  // Ensure description is a string (TipTap output). Fallback to empty string.
  const descriptionHtml = description || '';

  return (
    <section className="bg-gradient-to-br from-[#E8F0F7] to-[#F0F4F9] py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* LEFT */}
          <div className="space-y-6 w-full">
            {/* Dynamic Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                <span className="text-[#1E4C8F]">{part1 || 'On-Job Support'}</span>
                {part2 && <span className="text-[#1E4C8F] ml-2">{part2}</span>}
              </h1>
            </div>

            {/* Description: TipTap HTML — render inside a div to avoid nesting block elements inside <p> */}
            <SafeHTML html={descriptionHtml} className="text-lg text-gray-700 leading-relaxed" />

            {/* Button */}
            <div className="flex gap-4 pt-2">
              {buttonLink ? (
                <a
                  href={buttonLink}
                  className="bg-[#1E4C8F] hover:bg-[#163C72] text-white px-8 py-5 text-base rounded-lg shadow-md inline-block text-center"
                >
                  {buttonText || 'Get Support'}
                </a>
              ) : (
                <Button
                  onClick={() => setShowEnrollModal(true)}
                  className="bg-[#1E4C8F] hover:bg-[#163C72] text-white px-8 py-5 text-base rounded-lg shadow-md"
                >
                  {buttonText || 'Get Support'}
                </Button>
              )}
            </div>

            {showEnrollModal && (
              <EnrollModal
                courses={courses}
                page="On-Job Support"
                onClose={() => setShowEnrollModal(false)}
              />
            )}

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6 pt-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <span>4.8/5 Rating</span>
              </div>

              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <span>Trusted Support</span>
              </div>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          {/* Performance: Priority image for LCP - hero image is above the fold */}
          <div className="hidden md:flex justify-center relative">
            <div className="relative w-[750px] h-[400px] flex items-center justify-center z-10">
              <Image
                src={imagePath || '/on-job-support/Frame 275.png'}
                alt="On-job support"
                width={550}
                height={550}
                className="object-contain drop-shadow-xl"
                style={{ width: 'auto', height: 'auto', transform: `scale(${IMAGE_SCALE})` }}
                priority
                loading="eager"
                quality={85}
                sizes="(max-width: 768px) 0px, 550px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const HeroSectionComponent: React.FC<HeroSectionProps> = HeroSection;
export default HeroSectionComponent;
