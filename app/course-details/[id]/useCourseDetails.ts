'use client';

import { useState, useEffect } from 'react';
import { safeFetchJson } from '@/lib/fetchHelper';
import { getApiBaseUrl } from '@/lib/apiConfig';
import { logger } from '@/lib/logger';
import type { Course, CourseDetails } from '@/types/api';

export function useCourseDetails(id: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Get normalized API base URL
  const api = getApiBaseUrl();

  useEffect(() => {
    async function load() {
      if (!id || id === '') {
        logger.warn('Course ID is empty, skipping fetch');
        setLoading(false);
        return;
      }

      try {
        const courseUrl = `${api}/courses/${id}`;
        logger.debug('Fetching course from:', courseUrl);

        const { data: json, error } = await safeFetchJson(courseUrl, {
          cache: 'no-store',
          mode: 'cors',
        });

        if (error || !json) {
          logger.error('API Error:', error);
          throw new Error(error || 'Failed to fetch course');
        }

        // Handle different API response formats
        const jsonAny = json as any;
        const courseData = (jsonAny.course || jsonAny.data || jsonAny) as Course;
        const detailsData = (jsonAny.details || courseData?.details) as CourseDetails | null;

        // Ensure details is always an object with expected properties
        const normalizedDetails: CourseDetails = detailsData
          ? {
              agenda: detailsData.agenda || [],
              why_choose: detailsData.why_choose || [],
              who_should_join: detailsData.who_should_join || [],
              key_outcomes: detailsData.key_outcomes || [],
              meta_title: detailsData.meta_title || null,
              meta_description: detailsData.meta_description || null,
              meta_keywords: detailsData.meta_keywords || null,
              ...detailsData,
            }
          : {
              agenda: [],
              why_choose: [],
              who_should_join: [],
              key_outcomes: [],
              meta_title: null,
              meta_description: null,
              meta_keywords: null,
            };

        setCourse({
          ...courseData,
          details: normalizedDetails,
        });

        // Load all courses (for dropdown). Use same api base and robust error handling
        const allUrl = `${api}/courses`;
        const { data: allJson } = await safeFetchJson(allUrl, {
          cache: 'no-store',
          mode: 'cors',
        });
        if (allJson) {
          const allJsonAny = allJson as any;
          const courses = Array.isArray(allJsonAny) ? allJsonAny : allJsonAny.data || [];
          setAllCourses(courses as Course[]);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        logger.error('Fetch failed:', errorMessage);
        setCourse(null); // Ensure course is null on error
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      load();
    } else {
      setLoading(false);
    }
  }, [id, api]);

  return { course, allCourses, loading };
}
