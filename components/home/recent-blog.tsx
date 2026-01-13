'use client';

import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import parse from 'html-react-parser';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function RecentBlogs({ blogs, blogHeading }: any) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true); // Always show initially, will update on check

  // Normalize blog data from API (handle different field names)
  const normalizedBlogs = blogs.map((blog: any) => ({
    id: blog.blog_id || blog.id,
    title: blog.blog_name || blog.title,
    slug: blog.url_friendly_title || blog.slug,
    image: blog.banner_image || blog.thumbnail_image || blog.images || '/placeholder.svg',
    date: blog.published_at,
    recent_blog: blog.recent_blog,
  }));

  // Sort blogs newest → oldest
  const sortedBlogs = useMemo(() => {
    return [...normalizedBlogs].sort(
      (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [normalizedBlogs]);

  // Check scroll position and update button states
  const checkScrollPosition = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    
    // Check if content overflows
    const hasOverflow = scrollWidth > clientWidth;
    
    if (!hasOverflow) {
      // No overflow, hide both buttons
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    
    // Check if we can scroll left (not at the start)
    setCanScrollLeft(scrollLeft > 10);
    
    // Check if we can scroll right (not at the end)
    // Use a small threshold (10px) to account for rounding
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  // Update scroll position on scroll events
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      checkScrollPosition();
    };

    el.addEventListener('scroll', handleScroll);
    
    // Initial check with multiple delays to ensure content is rendered
    const timeoutId1 = setTimeout(() => {
      checkScrollPosition();
    }, 100);
    
    const timeoutId2 = setTimeout(() => {
      checkScrollPosition();
    }, 500);
    
    const timeoutId3 = setTimeout(() => {
      checkScrollPosition();
    }, 1000);

    // Also check on resize
    const handleResize = () => {
      checkScrollPosition();
    };
    window.addEventListener('resize', handleResize);

    // Use ResizeObserver to detect when content size changes
    const resizeObserver = new ResizeObserver(() => {
      checkScrollPosition();
    });
    resizeObserver.observe(el);

    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [checkScrollPosition, sortedBlogs]);

  // Scroll handlers
  const scrollLeft = useCallback((e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    
    // Check if element is scrollable
    if (el.scrollWidth <= el.clientWidth) {
      return; // Not scrollable
    }
    
    // Calculate scroll amount based on card width + gap
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const isTablet = typeof window !== 'undefined' && window.innerWidth < 768;
    const cardWidth = isMobile ? 280 : isTablet ? 320 : 350;
    const gap = isMobile ? 16 : isTablet ? 24 : 32;
    const scrollAmount = cardWidth + gap;
    
    // Get current scroll position
    const currentScroll = el.scrollLeft;
    
    // Calculate new scroll position
    let newScrollLeft = currentScroll - scrollAmount;
    
    // Ensure we don't scroll past the start
    if (newScrollLeft < 0) {
      newScrollLeft = 0;
    }
    
    // Use scrollTo for more precise control
    el.scrollTo({ 
      left: newScrollLeft, 
      behavior: 'smooth' 
    });
    
    // Update button states after scroll animation
    setTimeout(() => {
      checkScrollPosition();
    }, 400);
  }, [checkScrollPosition]);

  const scrollRight = useCallback((e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    
    // Check if element is scrollable
    if (el.scrollWidth <= el.clientWidth) {
      return; // Not scrollable
    }
    
    // Calculate scroll amount based on card width + gap
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const isTablet = typeof window !== 'undefined' && window.innerWidth < 768;
    const cardWidth = isMobile ? 280 : isTablet ? 320 : 350;
    const gap = isMobile ? 16 : isTablet ? 24 : 32;
    const scrollAmount = cardWidth + gap;
    
    // Get current scroll position and max scroll
    const currentScroll = el.scrollLeft;
    const maxScroll = el.scrollWidth - el.clientWidth;
    
    // Calculate new scroll position
    let newScrollLeft = currentScroll + scrollAmount;
    
    // Ensure we don't scroll past the end
    if (newScrollLeft > maxScroll) {
      newScrollLeft = maxScroll;
    }
    
    // Use scrollTo for more precise control
    el.scrollTo({ 
      left: newScrollLeft, 
      behavior: 'smooth' 
    });
    
    // Update button states after scroll animation
    setTimeout(() => {
      checkScrollPosition();
    }, 400);
  }, [checkScrollPosition]);

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 bg-white relative">
      <div className="max-w-7xl mx-auto">
        {/* ⭐ CMS Heading (hydration safe wrapper) */}
        {/* Check if blogHeading already contains HTML heading tags */}
        {blogHeading ? (
          typeof blogHeading === 'string' &&
          (blogHeading.includes('<h1') ||
            blogHeading.includes('<h2') ||
            blogHeading.includes('<h3')) ? (
            <div className="mb-8 sm:mb-12">{parse(blogHeading)}</div>
          ) : (
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 sm:mb-12 px-2">{parse(blogHeading)}</h2>
          )
        ) : (
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 sm:mb-12 px-2">Recent Blogs</h2>
        )}

        {/* Horizontal Scrollable Container with Navigation Buttons */}
        <div className="relative -mx-4 sm:-mx-6 px-4 sm:px-6 group" style={{ minHeight: '450px' }}>
          {/* Left Scroll Button - Always visible */}
          <button
            onClick={scrollLeft}
            aria-label="Scroll left"
            className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 bg-transparent transition-all duration-200 hover:scale-110 active:scale-95 focus-visible:outline-none ${
              canScrollLeft 
                ? 'opacity-100 cursor-pointer' 
                : 'opacity-50 cursor-pointer'
            }`}
          >
            <ChevronLeft className={`w-8 h-8 sm:w-10 sm:h-10 ${canScrollLeft ? 'text-blue-600 hover:text-blue-700' : 'text-gray-400'}`} />
          </button>

          {/* Right Scroll Button - Always visible */}
          <button
            onClick={scrollRight}
            aria-label="Scroll right"
            className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 bg-transparent transition-all duration-200 hover:scale-110 active:scale-95 focus-visible:outline-none ${
              canScrollRight 
                ? 'opacity-100 cursor-pointer' 
                : 'opacity-50 cursor-pointer'
            }`}
          >
            <ChevronRight className={`w-8 h-8 sm:w-10 sm:h-10 ${canScrollRight ? 'text-blue-600 hover:text-blue-700' : 'text-gray-400'}`} />
          </button>

          {/* Scrollable Content */}
          <div
            ref={scrollRef}
            className="overflow-x-auto overflow-y-visible scrollbar-hidden pb-4 flex gap-4 sm:gap-6 md:gap-8"
            style={{
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {sortedBlogs.map((b: any, index: number) => {
              // Image extraction - normalized field
              let img = b.image || '/placeholder.svg';

              if (!img.startsWith('/') && !img.startsWith('http')) {
                img = '/' + img;
              }

              const blogUrl = `/blog/${b.slug}`;
              return (
                <div
                  key={`${b.id}-${index}`}
                  onClick={(e) => {
                    // Only navigate if click is not on the button
                    const target = e.target as HTMLElement;
                    if (!target.closest('a')) {
                      window.location.href = blogUrl;
                    }
                  }}
                  className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition p-4 border flex flex-col w-[280px] sm:w-[320px] md:w-[350px] flex-shrink-0 h-[380px] sm:h-[400px] md:h-[420px] cursor-pointer"
                >
                  <div className="relative w-full h-44 sm:h-48 mb-4 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={img}
                      alt={b.title}
                      fill
                      className="object-cover"
                      loading="lazy"
                      sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, 350px"
                      // Bypass Next.js optimization for Cloudinary images to prevent timeout
                      unoptimized={typeof img === 'string' && img.includes('res.cloudinary.com')}
                    />
                  </div>

                  <div className="flex flex-col flex-1 min-h-0">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] flex-shrink-0">
                      {b.title}
                    </h3>

                    <span className="text-xs sm:text-sm text-gray-500 block mb-2 sm:mb-3 flex-shrink-0">
                      {b.date ? new Date(b.date).toDateString() : ''}
                    </span>

                    <a
                      href={blogUrl}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Read more: ${b.title}`}
                      className="bg-[#1e5ba8] text-white px-4 py-2 rounded text-sm hover:bg-blue-700 active:bg-blue-800 mt-auto self-start min-h-[44px] flex items-center transition-colors flex-shrink-0"
                    >
                      <span className="sr-only">Read more: </span>
                      Read More
                      <span className="sr-only"> about {b.title}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
