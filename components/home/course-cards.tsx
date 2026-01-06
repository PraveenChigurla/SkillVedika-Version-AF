'use client';

import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { Course } from '@/types/api';

interface CourseCardsProps {
  statusFilter: string;
}

export default function CourseCards({ statusFilter }: Readonly<CourseCardsProps>) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewAll, setViewAll] = useState(false);
  const [direction, setDirection] = useState(0);

  const itemsPerPage = 3;
  const router = useRouter();

  // ============================
  // FETCH COURSES (once) - Using native fetch instead of axios to reduce bundle size
  // ============================
  useEffect(() => {
    async function load() {
      try {
        const { getApiUrl } = await import('@/lib/apiConfig');
        const apiUrl = getApiUrl('/courses');
        const res = await fetch(apiUrl, {
          headers: {
            Accept: 'application/json',
          },
        });

        if (!res.ok) {
          // Silently handle 500 errors - backend may be temporarily unavailable
          if (res.status >= 500) {
            setCourses([]);
            return;
          }
          // Only throw for client errors (4xx) in development
          if (process.env.NODE_ENV === 'development' && res.status < 500) {
            console.warn(`Failed to fetch courses: ${res.status}`);
          }
          setCourses([]);
          return;
        }

        const responseData = await res.json();
        let coursesArray = [];

        if (Array.isArray(responseData)) {
          coursesArray = responseData;
        } else if (responseData?.data && Array.isArray(responseData.data)) {
          coursesArray = responseData.data;
        } else if (
          responseData?.success &&
          responseData?.data &&
          Array.isArray(responseData.data)
        ) {
          coursesArray = responseData.data;
        } else {
          console.warn('Unexpected courses API response format:', responseData);
          coursesArray = [];
        }

        setCourses(coursesArray);
      } catch (error) {
        // Only log non-network errors in development
        const isNetworkError = error instanceof Error && 
          (error.message.includes('fetch') || 
           error.message.includes('network') ||
           error.message.includes('ECONNREFUSED'));
        if (!isNetworkError && process.env.NODE_ENV === 'development') {
          console.warn('Error fetching courses:', error);
        }
        setCourses([]);
      }
    }
    // Defer loading to reduce initial TBT
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(load, { timeout: 2000 });
    } else {
      setTimeout(load, 100);
    }
  }, []);

  // ======================================================
  // FILTER COURSES WHEN statusFilter OR courses CHANGES
  // Optimized with startTransition to reduce TBT
  // ======================================================
  useEffect(() => {
    if (!courses.length) return;

    // Use startTransition for non-urgent filtering to reduce TBT
    startTransition(() => {
      const filtered = courses.filter(c => c.status?.toLowerCase() === statusFilter);
      setFilteredCourses(filtered);
      setCurrentIndex(0);
    });
  }, [statusFilter, courses]);

  // ============================
  // PAGINATION LOGIC
  // ============================
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  const visibleCourses = viewAll
    ? filteredCourses
    : filteredCourses.slice(
        currentIndex * itemsPerPage,
        currentIndex * itemsPerPage + itemsPerPage
      );

  // ============================
  // SLIDE ANIMATION VARIANTS
  // ============================
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 120 : -120,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
      x: direction > 0 ? -120 : 120,
      opacity: 0,
    }),
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex(prev => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex(prev => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  const handleViewAllClick = () => {
    setViewAll(true);
    router.push('/courses');
  };

  // ============================
  // RENDER
  // ============================
  // Show loading state while fetching
  if (courses.length === 0 && filteredCourses.length === 0) {
    return (
      <section className="py-12 sm:py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">Loading courses...</p>
        </div>
      </section>
    );
  }

  // Show empty state if no courses match filter
  if (filteredCourses.length === 0) {
    return (
      <section className="py-12 sm:py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">
            No {statusFilter} courses available at the moment.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative mt-1">
          {/* SLIDER + GRID */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={viewAll ? 'all' : currentIndex}
              custom={direction}
              variants={viewAll ? undefined : slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { duration: 0.35 },
                opacity: { duration: 0.22 },
              }}
              className={`grid ${
                viewAll
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
            } gap-4 sm:gap-6 md:gap-8 mb-6`}
            >
              {visibleCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={viewAll ? { opacity: 0, y: 18 } : undefined}
                  animate={viewAll ? { opacity: 1, y: 0 } : {}}
                  transition={viewAll ? { duration: 0.36, delay: index * 0.08 } : {}}
                  whileHover={{ y: -6 }}
                  className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                >
                  <div className="relative">
                    <Image
                      src={course.image || '/placeholder-course.png'}
                      alt={course.title}
                      width={400}
                      height={192}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500 image-auto-aspect"
                      quality={85}
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      // Bypass Next.js optimization for Cloudinary images to prevent timeout
                      unoptimized={typeof course.image === 'string' && course.image.includes('res.cloudinary.com')}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="p-6 text-left flex flex-col flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg leading-snug line-clamp-2">
                      {course.title}
                    </h3>
                    {course.students && (
                      <p className="text-xs text-gray-600 mb-2">
                        {course.students} Students enrolled
                      </p>
                    )}

                    {/* 
                    <p className="text-sm font-semibold text-[#2C5AA0] mb-4">
                      ₹250/Month
                    </p> */}

                    <div className="mt-auto flex items-center justify-between">
                      {/* <a
                        href="/course-details"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#2C5AA0] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#1A3F66] transition-all shadow-sm hover:shadow-md"
                      >
                        View more
                      </a> */}

                      <button
                        onClick={() =>
                          router.push(
                            `/course-details/${course.slug || course.details?.slug || course.id}`
                          )
                        }
                        aria-label={`View more details about ${course.title}`}
                        className="bg-[#2C5AA0] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#1A3F66] transition-all shadow-sm hover:shadow-md min-h-[44px]"
                      >
                        View more
                      </button>

                      {course.rating && (
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={
                                  i < course.rating!
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            ({Number(course.rating).toFixed(1)})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* ============================
              PAGINATION + DOTS + BUTTON
          ============================ */}
          <div className="relative mt-2">
            <div className="flex items-center justify-between py-3">
              {/* CENTER ARROWS + DOTS */}
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-6 z-10 bg-transparent px-3">
                  {/* Prev */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePrev}
                    disabled={viewAll}
                    aria-label="Previous courses"
                    className={`p-3 rounded-full border border-gray-200 shadow-sm transition-all group min-w-[44px] min-h-[44px] flex items-center justify-center ${
                      viewAll
                        ? 'opacity-50 cursor-not-allowed bg-white'
                        : 'bg-white hover:bg-[#2C5AA0]'
                    }`}
                  >
                    <ChevronLeft
                      size={20}
                      aria-hidden="true"
                      className={`${
                        viewAll ? 'text-gray-400' : 'text-[#2C5AA0] group-hover:text-white'
                      }`}
                    />
                  </motion.button>

                  {/* Dots */}
                  <div className="flex gap-3 items-center">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <motion.button
                        key={i}
                        whileHover={viewAll ? {} : { scale: 1.15 }}
                        onClick={() => !viewAll && setCurrentIndex(i)}
                        disabled={viewAll}
                        aria-label={`Go to page ${i + 1}`}
                        className={`w-3 h-3 rounded-full transition-all duration-200 min-w-[4px] min-h-[4px] flex items-center justify-center ${
                          currentIndex === i ? 'bg-[#2C5AA0] scale-110' : 'bg-gray-300'
                        } ${viewAll ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                    ))}
                  </div>

                  {/* Next */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    disabled={viewAll}
                    aria-label="Next courses"
                    className={`p-3 rounded-full border border-gray-200 shadow-sm transition-all group min-w-[44px] min-h-[44px] flex items-center justify-center ${
                      viewAll
                        ? 'opacity-50 cursor-not-allowed bg-white'
                        : 'bg-white hover:bg-[#2C5AA0]'
                    }`}
                  >
                    <ChevronRight
                      size={20}
                      aria-hidden="true"
                      className={`${
                        viewAll ? 'text-gray-400' : 'text-[#2C5AA0] group-hover:text-white'
                      }`}
                    />
                  </motion.button>
                </div>
              </div>

              {/* VIEW ALL BUTTON */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleViewAllClick}
                className="relative bg-[#2C5AA0] text-white px-5 py-3 rounded-full font-semibold text-sm shadow-md hover:shadow-lg hover:bg-[#1A3F66] transition-all"
              >
                View All Courses
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
