// 'use client';

// import { useState, startTransition } from 'react';
// import { Star, ChevronLeft, ChevronRight } from 'lucide-react';


// interface CourseRowProps {
//   title: string;
//   courses: any[];
//   disableArrows?: boolean;
//   gapTop?: string;
//   gapBottom?: string;
//   onViewAll?: (title: string) => void;
//   onBack?: () => void;
// }

// export default function CourseRow({
//   title,
//   courses,
//   disableArrows = false,
//   gapTop = 'mt-16',
//   gapBottom = 'mb-20',
//   onViewAll = () => {},
//   onBack = () => {},
// }: CourseRowProps) {
//   const itemsPerPage = 3;
//   const [currentIndex, setCurrentIndex] = useState(0);

//   const totalPages = Math.ceil(courses.length / itemsPerPage);

//   const visibleCourses = disableArrows
//     ? courses
//     : courses.slice(currentIndex * itemsPerPage, currentIndex * itemsPerPage + itemsPerPage);

//   const handlePrev = () => {
//     startTransition(() => {
//       setCurrentIndex(prev => (prev === 0 ? totalPages - 1 : prev - 1));
//     });
//   };

//   const handleNext = () => {
//     startTransition(() => {
//       setCurrentIndex(prev => (prev === totalPages - 1 ? 0 : prev + 1));
//     });
//   };

//   return (
//     <section className={`${gapTop} ${gapBottom}`}>
//       <div className="flex items-center justify-between mb-6 pr-4">
//         <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>

//         {disableArrows ? (
//           <button
//             onClick={onBack}
//             className="px-5 py-2 rounded-full border border-gray-300 text-gray-800 hover:bg-gray-100 transition"
//           >
//             ← Back
//           </button>
//         ) : (
//           <button
//             onClick={() => onViewAll(title)}
//             className="px-5 py-2 rounded-full border border-gray-300 text-gray-800 hover:bg-gray-100 transition"
//           >
//             View all courses
//           </button>
//         )}
//       </div>

//       <div className="relative">
//         {!disableArrows && (
//           <>
//             <button
//               onClick={handlePrev}
//               aria-label="Previous courses"
//               className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full shadow-md bg-white border border-gray-300 hover:bg-[#2C5AA0] group transition-all min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-90"
//             >
//               <ChevronLeft
//                 size={20}
//                 className="text-[#2C5AA0] group-hover:text-white"
//                 aria-hidden="true"
//               />
//             </button>

//             <button
//               onClick={handleNext}
//               aria-label="Next courses"
//               className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full shadow-md bg-white border border-gray-300 hover:bg-[#2C5AA0] group transition-all min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-90"
//             >
//               <ChevronRight
//                 size={20}
//                 className="text-[#2C5AA0] group-hover:text-white"
//                 aria-hidden="true"
//               />
//             </button>
//           </>
//         )}

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
//           {visibleCourses.map((course, index) => (
//             <div
//               key={course.id}
//               className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
//             >
//               <div className="relative w-full h-40 overflow-hidden bg-gray-100">
//                 {course.image ? (
//                   // <Image
//                   //   src={course.image}
//                   //   alt={course.title || 'Course'}
//                   //   fill
//                   //   sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
//                   //   className="object-cover group-hover:scale-105 transition-transform duration-500"
//                   //   loading={index < 3 ? 'eager' : 'lazy'}
//                   //   priority={index < 3}
//                   //   quality={75}
//                   //   // Bypass Next.js optimization for Cloudinary images to prevent timeout
//                   //   unoptimized={typeof course.image === 'string' && course.image.includes('res.cloudinary.com')}
//                   //   onError={e => {
//                   //     // Fallback to placeholder on error
//                   //     e.currentTarget.src = '/placeholder-course.jpg';
//                   //   }}
//                   // />
//                   <img
//                     src={course.image}
//                     alt={course.title || 'Course'}
//                     className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//                     loading={index < 3 ? 'eager' : 'lazy'}
//                     onError={e => {
//                       e.currentTarget.src = '/placeholder-course.svg';
//                     }}
//                   />
//                 ) : (
//                   <div className="w-full h-full bg-gray-200 flex items-center justify-center">
//                     <span className="text-gray-400 text-xs">No Image</span>
//                   </div>
//                 )}
//               </div>

//               <div className="p-4 text-left">
//                 <h3 className="font-semibold text-gray-900 mb-2 text-base leading-snug line-clamp-2">
//                   {course.title}
//                 </h3>

//                 <p className="text-xs text-gray-600 mb-2">{course.students} Students enrolled</p>

//                 <div className="flex items-center justify-between">
//                   <a
//                     href={`/course-details/${course.slug || course.details?.slug || course.id}`}
//                     className="bg-[#2C5AA0] text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-[#1A3F66] transition-all shadow-sm hover:shadow-md"
//                   >
//                     View more
//                   </a>

//                   <div className="flex items-center gap-1">
//                     <div className="flex gap-1">
//                       {[...Array(5)].map((_, i) => (
//                         <Star
//                           key={i}
//                           size={12}
//                           className={
//                             i < Math.round(course.rating)
//                               ? 'fill-yellow-400 text-yellow-400'
//                               : 'text-gray-300'
//                           }
//                         />
//                       ))}
//                     </div>
//                     <span className="text-xs font-medium text-gray-700">
//                       ( {Number(course.rating).toFixed(1)} )
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

'use client';

import { useRef, useState, useEffect, memo } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface CourseRowProps {
  title: string;
  courses: any[];
  disableArrows?: boolean;
  gapTop?: string;
  gapBottom?: string;
  onViewAll?: (title: string) => void;
  onBack?: () => void;
  isFirst?: boolean;
}

function CourseRow({
  title,
  courses,
  disableArrows = false,
  gapTop,
  gapBottom,
  onViewAll = () => {},
  onBack = () => {},
  isFirst = false,
}: CourseRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [initialLimit, setInitialLimit] = useState(4); // Mobile default: 4 courses
  const [isMobile, setIsMobile] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Set initial limit based on screen size: 4 on mobile, 6 on desktop
  useEffect(() => {
    const updateLimit = () => {
      // Mobile: 4 courses, Desktop (lg+): 6 courses
      const isDesktop = window.innerWidth >= 1024;
      setInitialLimit(isDesktop ? 6 : 4);
      setIsMobile(window.innerWidth < 640);
    };
    
    updateLimit();
    window.addEventListener('resize', updateLimit);
    return () => window.removeEventListener('resize', updateLimit);
  }, []);

  // Reset expanded state when courses change (e.g., filter applied)
  useEffect(() => {
    setIsExpanded(false);
  }, [courses.length, title]);

  // Calculate visible courses based on expanded state
  // When expanded or in focused view, show all courses in vertical grid
  const shouldShowPreview = !disableArrows && !isExpanded && courses.length > initialLimit;
  const visibleCourses = shouldShowPreview ? courses.slice(0, initialLimit) : courses;
  const remainingCount = courses.length - initialLimit;
  
  // Determine layout: horizontal scroll for preview on mobile, vertical grid for expanded/focused
  const useVerticalGrid = isExpanded || disableArrows || !shouldShowPreview;

  // Check scroll position for arrow visibility
  const checkScroll = () => {
    if (!scrollRef.current || disableArrows) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    const element = scrollRef.current;
    if (!element || disableArrows) return;
    
    checkScroll();
    element.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    
    return () => {
      element.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [courses, disableArrows]);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.querySelector('div[data-card]')?.clientWidth || 280;
    const gap = 16; // gap-4 = 16px
    const scrollAmount = cardWidth + gap;
    
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -scrollAmount : scrollAmount,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <section className={isFirst ? '' : 'pt-0'}>
      {/* HEADER - Compact and clear */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
          {title}
        </h2>

        {disableArrows ? (
          <button
            onClick={onBack}
            className="text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2C5AA0] focus:ring-offset-2"
            aria-label="Go back to all categories"
          >
            ← Back
          </button>
        ) : shouldShowPreview ? (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2C5AA0] focus:ring-offset-2 font-medium"
            aria-label={`View all ${courses.length} ${title} courses`}
          >
            View all ({courses.length})
          </button>
        ) : isExpanded && courses.length > initialLimit ? (
          <button
            onClick={() => setIsExpanded(false)}
            className="text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2C5AA0] focus:ring-offset-2"
            aria-label={`Show less ${title} courses`}
          >
            Show less
          </button>
        ) : null}
      </div>

      {/* RESPONSIVE GRID - No horizontal scroll on tablet/desktop */}
      <div className="relative">
        {/* DESKTOP ARROWS - Only show for horizontal scroll preview (not expanded, not focused) */}
        {!disableArrows && !isExpanded && shouldShowPreview && (
          <>
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`
                hidden xl:flex absolute -left-8 top-1/2 -translate-y-1/2 z-10 
                w-10 h-10 rounded-full bg-white border border-gray-300 shadow-lg
                hover:bg-[#2C5AA0] group items-center justify-center
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-[#2C5AA0] focus:ring-offset-2
                disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white
                ${prefersReducedMotion ? '' : 'hover:scale-105 active:scale-95'}
              `}
              aria-label="Scroll left"
            >
              <ChevronLeft className="text-[#2C5AA0] group-hover:text-white transition-colors" size={18} />
            </button>

            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`
                hidden xl:flex absolute -right-8 top-1/2 -translate-y-1/2 z-10 
                w-10 h-10 rounded-full bg-white border border-gray-300 shadow-lg
                hover:bg-[#2C5AA0] group items-center justify-center
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-[#2C5AA0] focus:ring-offset-2
                disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white
                ${prefersReducedMotion ? '' : 'hover:scale-105 active:scale-95'}
              `}
              aria-label="Scroll right"
            >
              <ChevronRight className="text-[#2C5AA0] group-hover:text-white transition-colors" size={18} />
            </button>
          </>
        )}

        {/* RESPONSIVE GRID - Vertical grid when expanded/focused, horizontal scroll for preview only */}
        <div
          ref={scrollRef}
          className={`
            ${useVerticalGrid 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6'
              : 'flex gap-4 overflow-x-auto overflow-y-visible scroll-smooth snap-x snap-mandatory scrollbar-hidden px-1 sm:px-2 sm:grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 sm:gap-5 lg:gap-6 sm:px-0'
            }
          `}
          style={useVerticalGrid ? {} : {
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {visibleCourses.map((course, index) => {
            const courseUrl = `/course-details/${course.slug || course.id}`;
            
            return (
            <div
              key={course.id}
              data-card
              onClick={(e) => {
                // On mobile, make entire card clickable
                if (isMobile) {
                  window.location.href = courseUrl;
                }
              }}
              className={`
                ${useVerticalGrid ? '' : 'snap-start min-w-[280px]'}
                sm:min-w-0
                bg-white
                rounded-xl sm:rounded-2xl
                border border-gray-200
                shadow-sm
                hover:shadow-lg
                active:shadow-md
                transition-all duration-200
                flex flex-col
                overflow-hidden
                group
                ${isMobile ? 'cursor-pointer' : ''}
                ${prefersReducedMotion ? '' : 'hover:-translate-y-0.5 hover:border-gray-300 active:scale-[0.98]'}
                focus-within:ring-2 focus-within:ring-[#2C5AA0] focus-within:ring-offset-1
                sm:focus-within:ring-offset-2
              `}
              aria-label={`View ${course.title} course details`}
            >
              {/* IMAGE - Fixed aspect ratio to prevent CLS, more compact on mobile */}
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-gray-100 overflow-hidden">
                {course.image ? (
                  <img
                    src={course.image}
                    alt={course.title || 'Course image'}
                    className="w-full h-full object-cover transition-transform duration-300"
                    style={{
                      transform: prefersReducedMotion ? 'none' : 'scale(1)',
                    }}
                    onMouseEnter={(e) => {
                      if (!prefersReducedMotion) {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    loading={index < (shouldShowPreview ? initialLimit : 4) ? 'eager' : 'lazy'}
                    onError={e => {
                      const target = e.currentTarget;
                      target.src = '/placeholder-course.svg';
                      target.onerror = null;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 bg-gray-100">
                    No Image
                  </div>
                )}
              </div>

              {/* CONTENT - Mobile-first: compact, rating inline, full card clickable */}
              <div className="p-2.5 sm:p-4 flex flex-col flex-1">
                {/* TITLE + RATING - Inline on mobile, separate on desktop */}
                <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
                  <h3 className="font-semibold text-sm sm:text-base leading-tight line-clamp-2 flex-1 text-gray-900 min-h-[2rem] sm:min-h-[2.5rem]">
                    {course.title}
                  </h3>
                  {/* RATING - Inline with title on mobile */}
                  <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0 mt-0.5" aria-label={`Rating: ${Number(course.rating || 0).toFixed(1)} stars`}>
                    <Star
                      size={10}
                      className={
                        Math.round(course.rating || 0) > 0
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }
                      aria-hidden="true"
                    />
                    <span className="text-[10px] sm:text-xs text-gray-700 font-medium">
                      {Number(course.rating || 0).toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* STUDENTS - Compact on mobile */}
                <p className="text-[10px] sm:text-xs text-gray-500 mb-2 sm:mb-3 flex-shrink-0">
                  {course.students || 0} Students
                </p>

                {/* CTA - Hidden on mobile (card is clickable), shown on desktop */}
                <div className="hidden sm:flex items-center justify-between mt-auto pt-1 gap-2">
                  <a
                    href={courseUrl}
                    className="bg-[#2C5AA0] text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-[#1A3F66] active:bg-[#153355] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2C5AA0] focus:ring-offset-1 flex-shrink-0"
                    aria-label={`View details for ${course.title}`}
                  >
                    View more
                  </a>

                  <div className="flex items-center gap-1 flex-shrink-0" aria-label={`Rating: ${Number(course.rating || 0).toFixed(1)} stars`}>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          size={11}
                          className={
                            i < Math.round(course.rating || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-700 font-medium">
                      {Number(course.rating || 0).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Memoize to prevent unnecessary re-renders when parent updates
export default memo(CourseRow);
