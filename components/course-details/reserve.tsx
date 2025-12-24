'use client';

import { useEffect, useState } from 'react';
import { EnrollModal } from '../EmptyLoginForm';
import { getApiUrl } from '@/lib/apiConfig';
import { logger } from '@/lib/logger';
import type { PlacementsReserveContent, Course } from '@/types/api';

interface ReserveProps {
  agenda?: string[];
}

export default function Reserve({ agenda = [] }: ReserveProps) {
  const [content, setContent] = useState<PlacementsReserveContent | null>(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [courses, setCourses] = useState<Array<{ id: number; title: string }>>([]);

  const agendaList = Array.isArray(agenda) ? agenda : [];

  useEffect(() => {
    const apiUrl = getApiUrl('/placements-reserve');

    fetch(apiUrl, {
      headers: {
        Accept: 'application/json',
      },
    })
      .then(res => {
        if (!res.ok) {
          logger.warn('Reserve API error:', res.status);
          return null;
        }
        return res.json();
      })
      .then(response => {
        if (!response) {
          // Set default content if API fails
          setContent({
            reserve_title: { main: 'Reserve Your Spot' },
            reserve_subtitle: 'Join our exclusive program',
            reserve_block1: ['0', 'Days'],
            reserve_block2: ['0', 'Hours'],
            reserve_block3: ['0', 'Minutes'],
            reserve_button_name: 'Enroll Now',
          });
          return;
        }
        // Backend returns a direct object (not wrapped in {success, data})
        // The response already contains reserve_block1, reserve_block2, reserve_block3
        setContent(response as PlacementsReserveContent);
      })
      .catch(err => {
        logger.error('Reserve API error:', err);
        // Set default content on error
        setContent({
          reserve_title: { main: 'Reserve Your Spot' },
          reserve_subtitle: 'Join our exclusive program',
          reserve_block1: ['0', 'Days'],
          reserve_block2: ['0', 'Hours'],
          reserve_block3: ['0', 'Minutes'],
          reserve_button_name: 'Enroll Now',
        });
      });
  }, []);

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

  // Don't return null - render with default content if needed
  const displayContent = content || {
    reserve_title: { main: 'Reserve Your Spot' },
    reserve_subtitle: 'Join our exclusive program',
    reserve_block1: ['0', 'Days'],
    reserve_block2: ['0', 'Hours'],
    reserve_block3: ['0', 'Minutes'],
    reserve_button_name: 'Enroll Now',
  };

  return (
    <section className="bg-white px-6 py-16">
      <div className="max-w-4xl mx-auto text-center">
        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          {displayContent.reserve_title?.main || displayContent.title || 'Reserve Your Spot'}
        </h2>

        {/* Subtitle */}
        <p className="text-gray-600 mb-12">
          {displayContent.reserve_subtitle ||
            displayContent.description ||
            'Join our exclusive program'}
        </p>

        {/* Boxes */}
        <div className="grid md:grid-cols-3 gap-8 mb-10">
          {/* Box 1 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="text-3xl font-bold text-blue-900 mb-2">
              {(() => {
                try {
                  if (typeof displayContent.reserve_block1 === 'string') {
                    const parsed = JSON.parse(displayContent.reserve_block1);
                    return Array.isArray(parsed) ? parsed[0] : parsed;
                  }
                  return displayContent.reserve_block1?.[0] || agendaList.length || '0';
                } catch {
                  return displayContent.reserve_block1?.[0] || agendaList.length || '0';
                }
              })()}
            </div>
            <p className="text-gray-600 text-sm">
              {(() => {
                try {
                  if (typeof displayContent.reserve_block1 === 'string') {
                    const parsed = JSON.parse(displayContent.reserve_block1);
                    return Array.isArray(parsed) ? parsed[1] : '';
                  }
                  return displayContent.reserve_block1?.[1] || 'Days';
                } catch {
                  return displayContent.reserve_block1?.[1] || 'Days';
                }
              })()}
            </p>
          </div>

          {/* Box 2 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="text-3xl font-bold text-blue-900 mb-2">
              {(() => {
                try {
                  if (typeof displayContent.reserve_block2 === 'string') {
                    const parsed = JSON.parse(displayContent.reserve_block2);
                    return Array.isArray(parsed) ? parsed[0] : parsed;
                  }
                  return displayContent.reserve_block2?.[0] || '0';
                } catch {
                  return displayContent.reserve_block2?.[0] || '0';
                }
              })()}
            </div>
            <p className="text-gray-600 text-sm">
              {(() => {
                try {
                  if (typeof displayContent.reserve_block2 === 'string') {
                    const parsed = JSON.parse(displayContent.reserve_block2);
                    return Array.isArray(parsed) ? parsed[1] : '';
                  }
                  return displayContent.reserve_block2?.[1] || 'Hours';
                } catch {
                  return displayContent.reserve_block2?.[1] || 'Hours';
                }
              })()}
            </p>
          </div>

          {/* Box 3 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="text-3xl font-bold text-blue-900 mb-2">
              {(() => {
                try {
                  if (typeof displayContent.reserve_block3 === 'string') {
                    const parsed = JSON.parse(displayContent.reserve_block3);
                    return Array.isArray(parsed) ? parsed[0] : parsed;
                  }
                  return displayContent.reserve_block3?.[0] || '0';
                } catch {
                  return displayContent.reserve_block3?.[0] || '0';
                }
              })()}
            </div>
            <p className="text-gray-600 text-sm">
              {(() => {
                try {
                  if (typeof displayContent.reserve_block3 === 'string') {
                    const parsed = JSON.parse(displayContent.reserve_block3);
                    return Array.isArray(parsed) ? parsed[1] : '';
                  }
                  return displayContent.reserve_block3?.[1] || 'Minutes';
                } catch {
                  return displayContent.reserve_block3?.[1] || 'Minutes';
                }
              })()}
            </p>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={() => setShowEnrollModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg inline-block transition"
        >
          {displayContent.reserve_button_name || 'Enroll Now'}
        </button>

        {showEnrollModal && (
          <EnrollModal
            courses={courses}
            page="Course Details"
            onClose={() => setShowEnrollModal(false)}
          />
        )}
      </div>
    </section>
  );
}
