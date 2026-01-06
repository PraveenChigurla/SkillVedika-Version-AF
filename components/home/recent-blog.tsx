'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import parse from 'html-react-parser';

export default function RecentBlogs({ blogs, blogHeading }: any) {
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

        {/* Horizontal Scrollable Container - ONLY this section scrolls horizontally */}
        <div className="overflow-x-auto overflow-y-visible scrollbar-hidden pb-4 -mx-4 sm:-mx-6 px-4 sm:px-6 snap-x snap-mandatory">
          <div className="flex gap-4 sm:gap-6 md:gap-8 min-w-max">
            {sortedBlogs.map((b: any) => {
              // Image extraction - normalized field
              let img = b.image || '/placeholder.svg';

              if (!img.startsWith('/') && !img.startsWith('http')) {
                img = '/' + img;
              }

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition p-4 border flex flex-col h-full min-w-[280px] sm:min-w-[320px] md:min-w-[350px] flex-shrink-0 snap-start"
                >
                  <div className="relative w-full h-56 mb-5 rounded-lg overflow-hidden">
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

                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {b.title}
                  </h3>

                  <span className="text-sm text-gray-500 block mb-3">
                    {b.date ? new Date(b.date).toDateString() : ''}
                  </span>

                  <a
                    href={`/blog/${b.slug}`}
                    aria-label={`Read more: ${b.title}`}
                    className="bg-[#1e5ba8] text-white px-4 py-2 rounded text-sm hover:bg-blue-700 active:bg-blue-800 mt-auto self-start min-h-[44px] flex items-center transition-colors"
                  >
                    <span className="sr-only">Read more: </span>
                    Read More
                    <span className="sr-only"> about {b.title}</span>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
