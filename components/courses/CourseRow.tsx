'use client';

import { useState, startTransition } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface CourseRowProps {
  title: string;
  courses: any[];
  disableArrows?: boolean;
  gapTop?: string;
  gapBottom?: string;
  onViewAll?: (title: string) => void;
  onBack?: () => void;
}

export default function CourseRow({
  title,
  courses,
  disableArrows = false,
  gapTop = 'mt-16',
  gapBottom = 'mb-20',
  onViewAll = () => {},
  onBack = () => {},
}: CourseRowProps) {
  const itemsPerPage = 3;
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalPages = Math.ceil(courses.length / itemsPerPage);

  const visibleCourses = disableArrows
    ? courses
    : courses.slice(currentIndex * itemsPerPage, currentIndex * itemsPerPage + itemsPerPage);

  const handlePrev = () => {
    startTransition(() => {
      setCurrentIndex(prev => (prev === 0 ? totalPages - 1 : prev - 1));
    });
  };

  const handleNext = () => {
    startTransition(() => {
      setCurrentIndex(prev => (prev === totalPages - 1 ? 0 : prev + 1));
    });
  };

  return (
    <section className={`${gapTop} ${gapBottom}`}>
      <div className="flex items-center justify-between mb-6 pr-4">
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>

        {disableArrows ? (
          <button
            onClick={onBack}
            className="px-5 py-2 rounded-full border border-gray-300 text-gray-800 hover:bg-gray-100 transition"
          >
            ← Back
          </button>
        ) : (
          <button
            onClick={() => onViewAll(title)}
            className="px-5 py-2 rounded-full border border-gray-300 text-gray-800 hover:bg-gray-100 transition"
          >
            View all courses
          </button>
        )}
      </div>

      <div className="relative">
        {!disableArrows && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous courses"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full shadow-md bg-white border border-gray-300 hover:bg-[#2C5AA0] group transition-all min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-90"
            >
              <ChevronLeft
                size={20}
                className="text-[#2C5AA0] group-hover:text-white"
                aria-hidden="true"
              />
            </button>

            <button
              onClick={handleNext}
              aria-label="Next courses"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full shadow-md bg-white border border-gray-300 hover:bg-[#2C5AA0] group transition-all min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-90"
            >
              <ChevronRight
                size={20}
                className="text-[#2C5AA0] group-hover:text-white"
                aria-hidden="true"
              />
            </button>
          </>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
          {visibleCourses.map((course, index) => (
            <div
              key={course.id}
              className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative w-full h-40 overflow-hidden bg-gray-100">
                {course.image ? (
                  <Image
                    src={course.image}
                    alt={course.title || 'Course'}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    loading={index < 3 ? 'eager' : 'lazy'}
                    priority={index < 3}
                    quality={75}
                    // Bypass Next.js optimization for Cloudinary images to prevent timeout
                    unoptimized={typeof course.image === 'string' && course.image.includes('res.cloudinary.com')}
                    onError={e => {
                      // Fallback to placeholder on error
                      e.currentTarget.src = '/placeholder-course.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No Image</span>
                  </div>
                )}
              </div>

              <div className="p-4 text-left">
                <h3 className="font-semibold text-gray-900 mb-2 text-base leading-snug line-clamp-2">
                  {course.title}
                </h3>

                <p className="text-xs text-gray-600 mb-2">{course.students} Students enrolled</p>

                <div className="flex items-center justify-between">
                  <a
                    href={`/course-details/${course.slug || course.details?.slug || course.id}`}
                    className="bg-[#2C5AA0] text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-[#1A3F66] transition-all shadow-sm hover:shadow-md"
                  >
                    View more
                  </a>

                  <div className="flex items-center gap-1">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={
                            i < Math.round(course.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      ( {Number(course.rating).toFixed(1)} )
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
