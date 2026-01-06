'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import parse from 'html-react-parser';

export default function RecentBlogs({ blogs, blogHeading }: any) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Normalize blog data from API (handle different field names)
  const normalizedBlogs = blogs.map((blog: any) => ({
    id: blog.blog_id || blog.id,
    title: blog.blog_name || blog.title,
    slug: blog.url_friendly_title || blog.slug,
    image: blog.banner_image || blog.thumbnail_image || blog.images || '/placeholder.svg',
    date: blog.published_at,
    recent_blog: blog.recent_blog,
  }));

  // Sort blogs newest → oldest, then reverse for right-to-left scrolling
  const sortedBlogs = useMemo(() => {
    const sorted = [...normalizedBlogs].sort(
      (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    // Reverse for right-to-left scrolling (newest appears on right)
    return sorted.reverse();
  }, [normalizedBlogs]);

  // Duplicate blogs for seamless infinite scroll
  const duplicatedBlogs = useMemo(() => {
    return [...sortedBlogs, ...sortedBlogs, ...sortedBlogs];
  }, [sortedBlogs]);

  // Auto-scroll continuously from right to left, pause on hover
  useEffect(() => {
    if (!scrollRef.current) return;

    let rafId: number;
    const speed = isHovered ? 0 : 1.2; // Scroll speed (adjust as needed)

    const step = () => {
      const el = scrollRef.current!;
      if (!el) return;

      // Scroll from right to left (decrease scrollLeft)
      el.scrollLeft += speed;

      // Reset to beginning when reaching the end (for seamless infinite scroll)
      // Since we duplicate the blogs 3 times, reset when we've scrolled past one set
      const oneSetWidth = el.scrollWidth / 3;
      if (el.scrollLeft >= oneSetWidth) {
        el.scrollLeft = 0;
      }

      rafId = requestAnimationFrame(step);
    };

    // Start scrolling after a brief delay
    const startDelay = setTimeout(() => {
      rafId = requestAnimationFrame(step);
    }, 100);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(startDelay);
    };
  }, [isHovered]);

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

        {/* Horizontal Scrollable Container - Auto-scrolls right to left */}
        <div className="overflow-x-auto overflow-y-visible scrollbar-hidden pb-4 -mx-4 sm:-mx-6 px-4 sm:px-6">
          <div
            ref={scrollRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setIsHovered(false)}
            className="flex gap-4 sm:gap-6 md:gap-8 min-w-max"
            style={{
              scrollBehavior: 'auto', // Disable smooth scroll for programmatic scrolling
            }}
          >
            {duplicatedBlogs.map((b: any, index: number) => {
              // Image extraction - normalized field
              let img = b.image || '/placeholder.svg';

              if (!img.startsWith('/') && !img.startsWith('http')) {
                img = '/' + img;
              }

              return (
                <div
                  key={`${b.id}-${index}`}
                  className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition p-4 border flex flex-col w-[280px] sm:w-[320px] md:w-[350px] flex-shrink-0 h-[380px] sm:h-[400px] md:h-[420px]"
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
                      href={`/blog/${b.slug}`}
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
