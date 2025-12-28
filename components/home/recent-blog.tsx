'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import parse from 'html-react-parser';

export default function RecentBlogs({ blogs, blogHeading }: any) {
  const cardsPerSlide = 3;

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

  // Group blogs into chunks of 3
  const slides = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < sortedBlogs.length; i += cardsPerSlide) {
      chunks.push(sortedBlogs.slice(i, i + cardsPerSlide));
    }
    return chunks;
  }, [sortedBlogs]);

  const [current, setCurrent] = useState(0);

  const next = () => setCurrent(p => (p + 1) % slides.length);
  const prev = () => setCurrent(p => (p - 1 + slides.length) % slides.length);

  return (
    <section className="py-16 px-6 bg-white relative">
      <div className="max-w-7xl mx-auto relative">
        {/* ⭐ CMS Heading (hydration safe wrapper) */}
        {/* Check if blogHeading already contains HTML heading tags */}
        {blogHeading ? (
          typeof blogHeading === 'string' &&
          (blogHeading.includes('<h1') ||
            blogHeading.includes('<h2') ||
            blogHeading.includes('<h3')) ? (
            <div className="mb-12">{parse(blogHeading)}</div>
          ) : (
            <h2 className="text-3xl font-bold text-gray-900 mb-12">{parse(blogHeading)}</h2>
          )
        ) : (
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Recent Blogs</h2>
        )}

        {/* Arrows */}
        <button
          onClick={prev}
          aria-label="Previous blog posts"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center 
                     bg-white shadow-md rounded-full hover:bg-gray-100 z-20 min-w-[44px] min-h-[44px]"
        >
          <ChevronLeft className="text-[#1e5ba8]" size={28} aria-hidden="true" />
        </button>

        <button
          onClick={next}
          aria-label="Next blog posts"
          className="absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center 
                     bg-white shadow-md rounded-full hover:bg-gray-100 z-20 min-w-[44px] min-h-[44px]"
        >
          <ChevronRight className="text-[#1e5ba8]" size={28} aria-hidden="true" />
        </button>

        {/* Slider */}
        <div className="overflow-hidden relative px-8">
          <div
            className="flex transition-transform duration-500"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {slides.map((group, i) => (
              <div
                key={i}
                className="min-w-full grid grid-cols-1 md:grid-cols-3 gap-10 px-4 items-stretch"
              >
                {group.map((b: any) => {
                  // Image extraction - normalized field
                  let img = b.image || '/placeholder.svg';

                  if (!img.startsWith('/') && !img.startsWith('http')) {
                    img = '/' + img;
                  }

                  return (
                    <div
                      key={b.id}
                      className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition p-4 border flex flex-col h-full"
                    >
                      <div className="relative w-full h-56 mb-5 rounded-lg overflow-hidden">
                        <Image
                          src={img}
                          alt={b.title}
                          fill
                          className="object-cover"
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
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
                        className="bg-[#1e5ba8] text-white px-4 py-2 rounded text-sm hover:bg-blue-700 mt-auto self-start min-h-[44px] flex items-center"
                      >
                        <span className="sr-only">Read more: </span>
                        Read More
                        <span className="sr-only"> about {b.title}</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
