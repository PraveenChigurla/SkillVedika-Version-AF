'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

export default function RecentBlogs({ blogs }: any) {
  // Responsive cards per slide: 1 on mobile, 2 on tablet, 3 on desktop
  const [cardsPerSlide, setCardsPerSlide] = useState(3);

  useEffect(() => {
    const updateCardsPerSlide = () => {
      if (window.innerWidth < 768) {
        setCardsPerSlide(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerSlide(2);
      } else {
        setCardsPerSlide(3);
      }
    };

    updateCardsPerSlide();
    window.addEventListener('resize', updateCardsPerSlide);
    return () => window.removeEventListener('resize', updateCardsPerSlide);
  }, []);

  // Normalize blog data from API (handle different field names)
  const normalizedBlogs = blogs.map((blog: any) => ({
    id: blog.blog_id || blog.id,
    title: blog.blog_name || blog.title,
    slug: blog.url_friendly_title || blog.slug,
    image: blog.banner_image || blog.thumbnail_image || blog.images || '/placeholder.svg',
    date: blog.published_at,
  }));

  // ✅ Sort blogs by published date (newest first)
  const sortedBlogs = useMemo(() => {
    return [...normalizedBlogs].sort(
      (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [normalizedBlogs]);

  // ✅ Split into slides of 3 cards each
  const slides = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < sortedBlogs.length; i += cardsPerSlide) {
      chunks.push(sortedBlogs.slice(i, i + cardsPerSlide));
    }
    return chunks;
  }, [sortedBlogs]);

  const [current, setCurrent] = useState(0);

  const next = () => setCurrent(prev => (prev + 1) % slides.length);
  const prev = () => setCurrent(prev => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="py-16 px-6 bg-white relative" aria-labelledby="recent-blogs-title">
      <div className="max-w-7xl mx-auto relative">
        <h2 id="recent-blogs-title" className="text-3xl font-bold text-gray-900 mb-12">
          Recent Blogs
        </h2>

        {/* ---------- ARROWS (LEFT + RIGHT) ----------- */}
        <button
          onClick={prev}
          aria-label="Previous blog posts"
          className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center 
                     bg-white shadow-md rounded-full hover:bg-gray-100 active:bg-gray-200 z-20 min-w-[44px] min-h-[44px] transition-all"
        >
          <ChevronLeft className="text-[#1e5ba8]" size={24} aria-hidden="true" />
        </button>

        <button
          onClick={next}
          aria-label="Next blog posts"
          className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center 
                     bg-white shadow-md rounded-full hover:bg-gray-100 active:bg-gray-200 z-20 min-w-[44px] min-h-[44px] transition-all"
        >
          <ChevronRight className="text-[#1e5ba8]" size={24} aria-hidden="true" />
        </button>

        {/* ---------- SLIDER CONTAINER ----------- */}
        <div className="overflow-hidden relative px-4 sm:px-8">
          <div
            className="flex transition-transform duration-500"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {slides.map((group, i) => {
              // Create a unique key from the first blog ID in the group
              const groupKey = group.length > 0 ? `slide-${group[0].id}-${i}` : `slide-empty-${i}`;
              return (
                <div
                  key={groupKey}
                  className="min-w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 px-4 items-stretch"
                >
                  {group.map((b: any) => {
                    // Image handling - normalized field
                    let img = b.image || '/placeholder.svg';

                    if (!img.startsWith('/') && !img.startsWith('http')) {
                      img = '/' + img;
                    }

                    return (
                      <article
                        key={b.id}
                        className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition p-4 border flex flex-col h-full"
                      >
                        <Image
                          src={img}
                          alt={b.title || 'Blog post image'}
                          width={400}
                          height={224}
                          className="w-full h-56 object-cover rounded-lg mb-5"
                          loading="lazy"
                          quality={85}
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />

                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                          {b.title}
                        </h3>

                        <time
                          className="text-sm text-gray-500 block mb-3"
                          dateTime={b.date || undefined}
                        >
                          {b.date ? new Date(b.date).toDateString() : ''}
                        </time>

                        <a
                          href={`/blog/${b.slug}`}
                          aria-label={`Read more about ${b.title}`}
                          className="bg-[#1e5ba8] text-white px-4 py-2 rounded text-sm hover:bg-blue-700 mt-auto self-start min-h-[44px] flex items-center"
                        >
                          Read More
                        </a>
                      </article>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
