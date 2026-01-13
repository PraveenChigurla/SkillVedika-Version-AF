'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Search, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import { getApiBaseUrl } from '@/lib/apiConfig';

export default function BlogSection({ sidebarName = 'Categories' }: { sidebarName?: string }) {
  const API = getApiBaseUrl();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [sidebarTitle, setSidebarTitle] = useState<string>(sidebarName || 'Categories');
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Mobile drawer state
  const [isCollapsed, setIsCollapsed] = useState(false); // Tablet collapse state

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
     CLOSE DRAWER ON ESCAPE KEY
  ------------------------------------------------------- */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  /* -------------------------------------------------------
     PREVENT BODY SCROLL WHEN DRAWER IS OPEN
  ------------------------------------------------------- */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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
  const BlogCard = ({ post }: any) => {
    const blogUrl = `/blog/${post.slug}`;
    return (
      <article 
        onClick={(e) => {
          // Only navigate if click is not on the button
          const target = e.target as HTMLElement;
          if (!target.closest('a')) {
            window.location.href = blogUrl;
          }
        }}
        className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden cursor-pointer"
      >
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
              href={blogUrl}
              onClick={(e) => e.stopPropagation()}
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
  };

  /* -------------------------------------------------------
     SIDEBAR CONTENT (Reusable for mobile drawer and desktop sidebar)
  ------------------------------------------------------- */
  const sidebarContent = (
    <>
      {/* Heading */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
            {sidebarTitle || sidebarName || 'Categories'}
          </h3>
        {/* Tablet collapse button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="lg:hidden p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
          aria-label={isCollapsed ? 'Expand categories' : 'Collapse categories'}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

          {/* SEARCH WITH DROPDOWN */}
          <div className="relative mb-4" ref={searchDropdownRef}>
            <div className="flex items-center rounded-full px-4 py-2 border border-gray-300">
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
                  className="ml-2 text-gray-400 hover:text-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
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
      <div
        className={`
          space-y-1.5 overflow-y-auto pr-2
          transition-all duration-300
          ${isCollapsed ? 'max-h-0 overflow-hidden' : 'max-h-[calc(100vh-280px)]'}
          lg:max-h-[calc(100vh-280px)]
        `}
      >
            {categories.map(cat => (
          <label
            key={cat.id}
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 p-2 rounded-md transition-colors -ml-2 -mr-2"
          >
                <input
                  type="checkbox"
                  checked={
                    cat.id === 'all'
                      ? selectedCats.length === 0
                      : selectedCats.includes(String(cat.id))
                  }
                  onChange={() => toggleCategory(String(cat.id))}
              className="w-4 h-4 accent-[#1E5BA8] cursor-pointer"
              aria-label={`Select ${cat.name} category`}
                />
            <span className="text-sm text-gray-800 select-none">
              {cat.name}
            </span>
              </label>
            ))}
          </div>

      {/* Footer - Show count */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{blogPosts.length}</span>{' '}
          {blogPosts.length === 1 ? 'Result' : 'Results'} found
        </p>
      </div>
    </>
  );

  /* -------------------------------------------------------
     UI RETURN
  ------------------------------------------------------- */
  return (
    <>
      {/* Mobile: Drawer Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile: Drawer */}
      <aside
        className={`
          lg:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50
          transform transition-transform duration-300 ease-out
          flex flex-col p-6
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Category filters"
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{sidebarTitle || 'Categories'}</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Close filters"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {sidebarContent}
        </div>
      </aside>

      <section className="py-10 sm:py-14 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto">
          {/* Mobile: Modern Filter Button - Top positioned, non-sticky */}
          <div className="lg:hidden relative mb-4 h-12 flex items-center justify-end">
            <button
              onClick={() => setIsOpen(true)}
              className="relative bg-gradient-to-r from-[#1E5BA8] to-[#2563EB] text-white px-5 py-3 rounded-2xl shadow-xl hover:shadow-2xl flex items-center gap-2.5 hover:from-[#1A3F66] hover:to-[#1E40AF] active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#1E5BA8] focus:ring-offset-2 backdrop-blur-sm border border-white/20 group cursor-pointer"
              aria-label="Open filters"
            >
              <div className="relative">
                <Filter className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                {selectedCats.length > 0 && selectedCats[0] !== 'all' && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-lg animate-pulse">
                    {selectedCats.length}
                  </span>
                )}
              </div>
              <span className="font-semibold text-sm tracking-wide">Filters</span>
              {selectedCats.length > 0 && selectedCats[0] !== 'all' && (
                <span className="bg-white/20 backdrop-blur-sm text-white rounded-lg px-2.5 py-1 text-xs font-bold min-w-[24px] text-center border border-white/30">
                  {selectedCats.length}
                </span>
              )}
            </button>
          </div>

          <div className="grid md:grid-cols-4 gap-6 lg:gap-10">
            {/* Tablet/Desktop: Sidebar */}
            <aside
              className={`
                hidden lg:block
                bg-white rounded-2xl shadow-sm border border-gray-200 p-5
                w-full
                max-h-[calc(100vh-180px)]
                overflow-hidden
                sticky top-20
                self-start
              `}
              aria-label="Category filters"
            >
              {sidebarContent}
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
                className="flex items-center gap-2 bg-white border border-gray-300 text-[#1E5BA8] px-4 py-2 rounded-full shadow hover:bg-blue-200 cursor-pointer"
              >
                <ChevronLeft size={20} />
                <span className="text-sm font-medium">Previous Page</span>
              </button>

              <button
                onClick={nextSlide}
                className="flex items-center gap-2 bg-white border border-gray-300 text-[#1E5BA8] px-4 py-2 rounded-full shadow hover:bg-blue-200 cursor-pointer"
              >
                <span className="text-sm font-medium">Next Page</span>
                <ChevronRight size={20} />
              </button>
            </div>
          )}
            </div>
        </div>
      </div>
    </section>
    </>
  );
}
