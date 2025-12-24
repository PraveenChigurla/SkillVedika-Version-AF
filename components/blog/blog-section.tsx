'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import Image from 'next/image';

export default function BlogSection({ sidebarName = 'Categories' }: { sidebarName?: string }) {
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [sidebarTitle, setSidebarTitle] = useState<string>(sidebarName || 'Categories');
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const blogContainerRef = useRef<HTMLDivElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement | null>(null);

  /* -------------------------------------------------------
     LEVENSHTEIN DISTANCE FOR FUZZY SEARCH
  ------------------------------------------------------- */
  const levenshtein = (a: string, b: string) => {
    const dp: number[][] = [];
    for (let i = 0; i <= a.length; i++) {
      dp[i] = new Array(b.length + 1).fill(0);
    }
    
    for (let i = 0; i <= a.length; i++) {
      dp[i]![0] = i;
    }
    for (let j = 0; j <= b.length; j++) {
      dp[0]![j] = j;
    }

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i]![j] = Math.min(
          dp[i - 1]![j]! + 1,
          dp[i]![j - 1]! + 1,
          dp[i - 1]![j - 1]! + cost
        );
      }
    }
    return dp[a.length]![b.length]!;
  };

  /* -------------------------------------------------------
     RANK BLOG TITLES BY QUERY MATCH
  ------------------------------------------------------- */
  const rankBlogTitles = (titles: string[], query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return titles.slice(0, 10);

    const scored = titles.map(title => {
      const t = title.toLowerCase();
      let score = 0;

      if (t.startsWith(q)) score += 100;
      if (t.includes(q)) score += 60;

      const dist = levenshtein(q, t);
      score += Math.max(0, 40 - dist);

      return { title, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 10).map(x => x.title);
  };

  /* -------------------------------------------------------
     DEBOUNCE SEARCH SUGGESTIONS
  ------------------------------------------------------- */
  useEffect(() => {
    if (!searchTerm.trim()) {
      setShowSearchDropdown(false);
      setSearchSuggestions([]);
      return;
    }

    const delay = setTimeout(() => {
      const titles = blogPosts.map(post => post.title);
      const suggestions = rankBlogTitles(titles, searchTerm);
      setSearchSuggestions(suggestions);
      setShowSearchDropdown(suggestions.length > 0);
    }, 200);

    return () => clearTimeout(delay);
  }, [searchTerm, blogPosts]);

  /* -------------------------------------------------------
     CLOSE SEARCH DROPDOWN ON OUTSIDE CLICK
  ------------------------------------------------------- */
  useEffect(() => {
    const handler = (e: any) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* -------------------------------------------------------
     FETCH BLOG POSTS (WITH FILTERS)
  ------------------------------------------------------- */
  const fetchBlogs = async () => {
    const url = new URL(`${API}/blogs`);

    // Category filter (skip if ALL)
    if (selectedCats.length > 0) {
      selectedCats.forEach((id, index) => {
        url.searchParams.append(`categories[${index}]`, id);
      });
    }

    if (searchTerm.trim()) {
      url.searchParams.append('search', searchTerm);
    }

    const res = await fetch(url);
    const data = await res.json();

    // Normalize blogs - handle database field names
    const blogs = data.map((item: any) => {
      // Determine image from various possible field names
      let img = item.banner_image || item.thumbnail_image || item.images || '/placeholder.svg';

      if (typeof img === 'string' && img.startsWith('[')) {
        try {
          const parsed = JSON.parse(img);
          img = parsed.thumbnail || parsed.banner || Object.values(parsed)[0] || '/placeholder.svg';
        } catch {}
      }

      if (!img.startsWith('/') && !img.startsWith('http')) {
        img = '/' + img;
      }

      return {
        id: item.blog_id || item.id,
        title: item.blog_name || item.title,
        description: item.short_description || item.excerpt?.short || '',
        date: item.published_at ? new Date(item.published_at).toDateString() : '',
        image: img,
        slug: item.url_friendly_title || item.slug,
        category_id: item.category_id,
      };
    });

    setBlogPosts(blogs);
    setCurrentSlide(0);
  };

  // ✅ Fetch blogs on mount and when filters change
  useEffect(() => {
    fetchBlogs();
  }, [selectedCats, searchTerm, API]);

  /* -------------------------------------------------------
     FETCH CATEGORIES (WITH "ALL")
  ------------------------------------------------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, pageRes] = await Promise.all([
          fetch(`${API}/blog-categories`),
          fetch(`${API}/blog-page`),
        ]);

        const catsData = await catsRes.json().catch(() => null);
        const pageData = await pageRes.json().catch(() => null);

        // Determine title priority:
        // 1) explicit sidebar prop passed in
        // 2) sidebar_name from blog page content endpoint (`/api/blog-page`)
        // 3) sidebar_name inferred from categories response
        let title = sidebarName || 'Categories';
        let fetchedCategories: any[] = [];

        if (pageData && pageData.data && pageData.data.sidebar_name) {
          title = pageData.data.sidebar_name;
        }

        if (Array.isArray(catsData)) {
          fetchedCategories = catsData.map((cat: any) => ({
            id: cat.category_id || cat.id,
            name: cat.category_name || cat.name,
          }));
          if (!pageData && catsData.length && catsData[0]?.sidebar_name) {
            title = catsData[0].sidebar_name;
          }
        } else if (catsData && Array.isArray((catsData as any).categories)) {
          fetchedCategories = (catsData as any).categories.map((cat: any) => ({
            id: cat.category_id || cat.id,
            name: cat.category_name || cat.name,
          }));
          if (!pageData && (catsData as any).sidebar_name) {
            title = (catsData as any).sidebar_name;
          }
        }

        setCategories([{ id: 'all', name: 'All' }, ...fetchedCategories]);
        setSidebarTitle(title);
      } catch (err) {
        setCategories([{ id: 'all', name: 'All' }]);
      }
    };

    fetchData();
  }, [API, sidebarName]);

  /* -------------------------------------------------------
     CATEGORY SELECT (ALL MODE)
  ------------------------------------------------------- */
  const toggleCategory = (id: string) => {
    if (id === 'all') {
      setSelectedCats([]);
      return;
    }

    let updated = selectedCats.includes(id)
      ? selectedCats.filter(c => c !== id)
      : [...selectedCats, id];

    setSelectedCats(updated);
  };

  /* -------------------------------------------------------
     PAGINATION LOGIC
  ------------------------------------------------------- */
  const perPage = 9;
  const pages = Math.max(1, Math.ceil(blogPosts.length / perPage));

  const slides = Array.from({ length: pages }).map((_, i) => {
    const start = i * perPage;
    return blogPosts.slice(start, start + perPage);
  });

  const nextSlide = () => setCurrentSlide(p => (p + 1) % pages);
  const prevSlide = () => setCurrentSlide(p => (p - 1 + pages) % pages);

  /* -------------------------------------------------------
     BLOG CARD
  ------------------------------------------------------- */
  const BlogCard = ({ post }: any) => (
    <article className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden">
      <div className="w-full h-44 bg-gray-100 overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          width={600}
          height={350}
          className="object-cover w-full h-full"
          quality={85}
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="p-5">
        <h4 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h4>

        <p className="text-gray-600 text-sm mb-3">{post.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{post.date}</span>
          <a
            href={`/blog/${post.slug}`}
            aria-label={`Read more: ${post.title}`}
            className="text-sm bg-[#1E5BA8] text-white px-3 py-1.5 rounded-md hover:bg-blue-900 min-h-[44px] flex items-center"
          >
            <span className="sr-only">Read more: </span>
            Read more
            <span className="sr-only"> about {post.title}</span>
          </a>
        </div>
      </div>
    </article>
  );

  /* -------------------------------------------------------
     UI RETURN
  ------------------------------------------------------- */
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">
        {/* --------------------------------------------
            SIDEBAR
        {/* SIDEBAR */}
        <aside className="bg-white rounded-3xl shadow p-6 md:col-span-1 h-[1150px] flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-5">
            {sidebarTitle || sidebarName || 'Categories'}
          </h3>

          {/* SEARCH WITH DROPDOWN */}
          <div className="relative mb-4" ref={searchDropdownRef}>
            <div className="flex items-center rounded-full px-4 py-2">
              <input
                type="text"
                placeholder="Search blog..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && searchSuggestions.length > 0 && searchSuggestions[0]) {
                    setSearchTerm(searchSuggestions[0]);
                    setShowSearchDropdown(false);
                  }
                }}
                className="flex-1 outline-none text-sm bg-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setShowSearchDropdown(false);
                  }}
                  aria-label="Clear search"
                  className="ml-2 text-gray-400 hover:text-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              )}
              {!searchTerm && <Search size={18} className="text-gray-400" aria-hidden="true" />}
            </div>

            {/* SEARCH SUGGESTIONS DROPDOWN */}
            {showSearchDropdown && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-40 max-h-48 overflow-y-auto">
                {searchSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchTerm(suggestion);
                      setShowSearchDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm text-gray-800 border-b last:border-b-0 transition"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CATEGORY LIST */}
          <div className="space-y-3 max-h-[950px] overflow-y-auto pr-2 custom-scrollbar">
            {categories.map(cat => (
              <label key={cat.id} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={
                    cat.id === 'all'
                      ? selectedCats.length === 0
                      : selectedCats.includes(String(cat.id))
                  }
                  onChange={() => toggleCategory(String(cat.id))}
                  className="w-8 h-4 accent-[#1E5BA8]"
                />
                <span className="text-sm text-gray-800">{cat.name}</span>
              </label>
            ))}
          </div>

          <p className="mt-6 text-sm text-gray-700">{blogPosts.length} Results found</p>
        </aside>

        {/* --------------------------------------------
            BLOG GRID SECTION
        -------------------------------------------- */}
        <div className="md:col-span-3 relative" ref={blogContainerRef}>
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((pageBlogs, pageIndex) => (
                <div key={pageIndex} className="min-w-full px-3">
                  {blogPosts.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 text-lg">No blogs found.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {pageBlogs.map((post, idx) => (
                        <BlogCard key={`${post.id}-${idx}`} post={post} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* PAGINATION */}
          {pages > 1 && blogPosts.length > 0 && (
            <div className="flex items-center justify-end gap-6 mt-10">
              <button
                onClick={prevSlide}
                className="flex items-center gap-2 bg-white border border-gray-300 text-[#1E5BA8] px-4 py-2 rounded-full shadow hover:bg-blue-200"
              >
                <ChevronLeft size={20} />
                <span className="text-sm font-medium">Previous Page</span>
              </button>

              <button
                onClick={nextSlide}
                className="flex items-center gap-2 bg-white border border-gray-300 text-[#1E5BA8] px-4 py-2 rounded-full shadow hover:bg-blue-200"
              >
                <span className="text-sm font-medium">Next Page</span>
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
