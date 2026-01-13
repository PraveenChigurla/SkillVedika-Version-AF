'use client';

import { useEffect, useState, startTransition, useMemo } from 'react';
import dynamic from 'next/dynamic';
import CourseRow from './CourseRow';
import type { Course } from '@/types/api';
import { getApiBaseUrl } from '@/lib/apiConfig';

// Skeleton Loader Component - More realistic
function CourseSkeletonLoader() {
  return (
    <div className="py-6 sm:py-8">
      <div className="space-y-10 sm:space-y-12">
        {/* Simulate 2 category sections */}
        {Array.from({ length: 2 }, (_, sectionIdx) => (
          <div key={`skeleton-section-${sectionIdx}`}>
            {/* Section header skeleton */}
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="h-7 bg-gray-200 rounded w-32 animate-pulse" />
              <div className="h-8 bg-gray-200 rounded-full w-24 animate-pulse" />
            </div>
            {/* Cards grid skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={`skeleton-${sectionIdx}-${i}`}
                  className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-pulse"
                >
                  <div className="w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9] bg-gray-200" />
                  <div className="p-4 sm:p-5 lg:p-6 space-y-3">
                    <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="flex items-center justify-between pt-2">
                      <div className="h-10 bg-gray-200 rounded w-24" />
                      <div className="h-5 bg-gray-200 rounded w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Empty State Component - Improved UX
function EmptyState() {
  return (
    <div className="text-center py-16 sm:py-20 px-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <svg
            className="mx-auto h-20 w-20 sm:h-24 sm:w-24 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
          No courses found
        </h3>
        <p className="text-gray-600 text-sm sm:text-base mb-6">
          No courses match your current filters. Try adjusting your search or category selection.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                const params = new URLSearchParams(window.location.search);
                params.delete('search');
                params.delete('category');
                const cleanUrl = `/courses${params.toString() ? `?${params}` : ''}`;
                window.history.replaceState({}, '', cleanUrl);
                window.location.reload();
              }
            }}
            className="px-4 py-2 bg-[#2C5AA0] text-white rounded-lg hover:bg-[#1A3F66] transition-colors text-sm font-medium"
          >
            Clear all filters
          </button>
        </div>
      </div>
    </div>
  );
}

// Lazy load CategorySidebar - it's not critical for initial render
const CategorySidebar = dynamic(() => import('./CategorySidebar'), {
  loading: () => <div className="w-64 h-96 bg-gray-50 rounded-lg animate-pulse"></div>,
});

interface Category {
  id: string | number;
  name: string;
}

export default function CourseGrid({ searchQuery = '', urlCategory = '', urlStatus = '' }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true); // Start with true to prevent empty state flash
  const [coursesLoaded, setCoursesLoaded] = useState(false); // Track if courses have been loaded at least once
  const [categoriesLoaded, setCategoriesLoaded] = useState(false); // Track if categories have been loaded at least once

  const [selectedCats, setSelectedCats] = useState(['all']);
  const [forcedCategory, setForcedCategory] = useState('');

  // ⭐ Prevents search-mode from staying disabled forever
  const [forceExitSearch, setForceExitSearch] = useState(false);

  // ⭐ FIX: Whenever URL searchQuery changes → allow search mode again
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setForceExitSearch(false);
    }
  }, [searchQuery]);

  // LOAD DATA - optimized with fetch, timeouts, and progressive rendering
  useEffect(() => {
    async function load() {
      try {
        const apiBase = getApiBaseUrl();
        console.log('apiBase: ', apiBase);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        // Defer categories fetch - sidebar is lazy loaded, not critical for initial render
        // Use requestIdleCallback to defer if available
        // const fetchCategories = async () => {
        //   const categoriesUrl = `${apiBase}/categories`;
        //   const catRes = (await Promise.race([
        //     fetch(categoriesUrl, {
        //       signal: controller.signal,
        //       headers: { Accept: 'application/json' },
        //       cache: 'default', // Browser cache
        //     }),
        //     new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1500)), // Reduced timeout
        //   ]).catch(() => ({ ok: false } as Response))) as Response | { ok: false };
        //   if (process.env.NODE_ENV === 'development') {
        //     console.log('[CourseGrid] Categories fetch result:', catRes.ok ? 'success' : 'failed', 'URL:', categoriesUrl);
        //   }
        //   // Set categories with startTransition for non-blocking update
        //   if (catRes.ok && 'json' in catRes) {
        //     try {
        //       const data = await (catRes as Response).json();
        //       const categoriesData = data?.data || data || [];
        //       startTransition(() => {
        //         setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        //       });
        //     } catch (e) {
        //       console.warn('Failed to parse categories:', e);
        //       startTransition(() => {
        //         setCategories([]);
        //       });
        //     }
        //   } else {
        //     startTransition(() => {
        //       setCategories([]);
        //     });
        //   }
        // };

        const fetchCategories = async () => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // ✅ 5s timeout

          try {
            if (!apiBase) {
              throw new Error('API base URL is not configured');
            }

            const res = await fetch(`${apiBase}/categories`, {
              signal: controller.signal,
              headers: { Accept: 'application/json' },
              cache: 'default',
            }).catch((fetchError) => {
              // Handle network errors (CORS, connection refused, etc.)
              if (fetchError instanceof TypeError && fetchError.message === 'Failed to fetch') {
                throw new Error('Network error: Unable to reach the API server. Please check if the server is running.');
              }
              throw fetchError;
            });

            if (!res.ok) {
              throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }

            const data = await res.json();
            const categoriesData = data?.data || data || [];

            startTransition(() => {
              setCategories(Array.isArray(categoriesData) ? categoriesData : []);
              setCategoriesLoaded(true); // Mark categories as loaded
            });

            if (process.env.NODE_ENV === 'development') {
              console.log('[CourseGrid] Categories loaded:', categoriesData.length);
            }
          } catch (err: any) {
            if (err.name === 'AbortError') {
              if (process.env.NODE_ENV === 'development') {
                console.warn('[CourseGrid] Categories request timed out');
              }
            } else {
              // Only log errors in development to avoid console noise
              if (process.env.NODE_ENV === 'development') {
                console.error('[CourseGrid] Categories fetch failed:', err.message || err);
              }
            }

            // Set empty array on error - UI will still work
            startTransition(() => {
              setCategories([]);
              setCategoriesLoaded(true); // Mark as loaded even on error
            });
          } finally {
            clearTimeout(timeoutId); // ✅ IMPORTANT
          }
        };

        // Defer categories fetch to reduce initial TBT
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          requestIdleCallback(fetchCategories, { timeout: 1000 });
        } else {
          setTimeout(fetchCategories, 100);
        }

        // Fetch courses - don't set loading state initially to avoid skeleton flash
        const coursesUrl = `${apiBase}/courses`;
        if (process.env.NODE_ENV === 'development') {
          console.log('[CourseGrid] Fetching courses from:', coursesUrl);
        }

        let courseRes: Response | { ok: false } = { ok: false };
        
        try {
          if (!apiBase) {
            throw new Error('API base URL is not configured');
          }

          courseRes = (await Promise.race([
            fetch(coursesUrl, {
              signal: controller.signal,
              headers: { Accept: 'application/json' },
              // Use browser cache - client components can't use Next.js cache options
              cache: 'default', // Browser will use cache if available
            }).catch((fetchError) => {
              // Handle network errors
              if (fetchError instanceof TypeError && fetchError.message === 'Failed to fetch') {
                throw new Error('Network error: Unable to reach the API server. Please check if the server is running.');
              }
              throw fetchError;
            }),
            new Promise<Response>((_, reject) =>
              setTimeout(() => reject(new Error('Timeout')), 2000)
            ), // Reduced to 2s
          ]).catch(() => ({ ok: false }) as Response)) as Response | { ok: false };
        } catch (fetchError: any) {
          if (process.env.NODE_ENV === 'development') {
            if (fetchError.name === 'AbortError') {
              console.warn('[CourseGrid] Courses request timed out');
            } else {
              console.error('[CourseGrid] Failed to fetch courses:', fetchError.message || fetchError);
            }
          }
          courseRes = { ok: false };
        }

        clearTimeout(timeoutId);

        // Handle courses with startTransition for non-blocking update
        let coursesData = [];
        if (courseRes.ok && 'json' in courseRes) {
          try {
            const data = await (courseRes as Response).json();
            coursesData = data?.data || data || [];
            if (process.env.NODE_ENV === 'development') {
              console.log('[CourseGrid] Successfully loaded courses:', coursesData.length);
            }
          } catch (e) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('[CourseGrid] Failed to parse courses:', e);
            }
          }
        } else if (process.env.NODE_ENV === 'development') {
          const status = (courseRes as Response).status;
          console.warn(
            '[CourseGrid] Failed to fetch courses.',
            status ? `Status: ${status}` : 'Network error',
            'URL:',
            coursesUrl
          );
        }

        // Use startTransition for non-urgent state updates to reduce TBT
        startTransition(() => {
          setCourses(Array.isArray(coursesData) ? coursesData : []);
          setCoursesLoaded(true); // Mark that courses have been loaded
          setLoading(false);
        });
      } catch (err) {
        const isAbortError = err instanceof Error && err.name === 'AbortError';
        const isDOMAbortError = err instanceof DOMException && err.name === 'AbortError';
        if (!isAbortError && !isDOMAbortError) {
          console.error('Error loading data:', err);
        }
        // Ensure arrays are set even on error
        setCategories([]);
        setCourses([]);
        setCoursesLoaded(true); // Mark as loaded even on error to prevent empty state flash
        setLoading(false);
      }
    }
    load();
  }, []);

  const q = searchQuery.trim().toLowerCase();
  const catQuery = urlCategory.trim().toLowerCase();

  // ⭐ Search mode only when searchQuery exists AND not force-disabled
  const isSearchMode = !forceExitSearch && q.length > 0 && !catQuery;

  // ⭐ CATEGORY SELECT HANDLER - optimized with startTransition
  const handleCategorySelect = (clickedId: string) => {
    // Use startTransition for non-urgent UI updates
    startTransition(() => {
      // -------- EXIT SEARCH MODE --------
      if (isSearchMode) {
        setForceExitSearch(true); // disable search mode instantly

        // Clear search param
        const params = new URLSearchParams(window.location.search);
        params.delete('search');
        params.delete('category');

        const cleanUrl = `/courses${params.toString() ? `?${params}` : ''}`;
        window.history.replaceState({}, '', cleanUrl);

        // Apply category immediately
        if (clickedId === 'all') {
          setSelectedCats(['all']);
        } else {
          setSelectedCats([clickedId]);
        }

        return;
      }

      // -------- NORMAL MODE --------
      if (clickedId === 'all') {
        setSelectedCats(['all']);
        return;
      }

      let updated = selectedCats.filter(x => x !== 'all');

      if (updated.includes(clickedId)) {
        updated = updated.filter(x => x !== clickedId);
      } else {
        updated.push(clickedId);
      }

      if (updated.length === 0) updated = ['all'];
      setSelectedCats(updated);
    });
  };

  // -------- GROUP COURSES BY CATEGORY --------
  // Optimize filtering with useMemo to reduce re-computation
  // Use startTransition to defer heavy filtering operations
  const { finalCategories, visibleCount } = useMemo(() => {
    // Ensure courses is an array before using filter
    let coursesArray = Array.isArray(courses) ? courses : [];
    const categoriesArray = Array.isArray(categories) ? categories : [];

    // ⛔ If courses or categories not loaded yet → show nothing (don't show empty state or "All Courses")
    if (coursesArray.length === 0 || !coursesLoaded || !categoriesLoaded) {
      return { finalCategories: [], visibleCount: 0 };
    }

    // STATUS FILTER - Filter by status if urlStatus is provided (e.g., ?status=trending)
    if (urlStatus && urlStatus.trim().length > 0) {
      const statusLower = urlStatus.toLowerCase().trim();
      coursesArray = coursesArray.filter(c => {
        const courseStatus = (c.status || '').toLowerCase();
        return courseStatus === statusLower;
      });
    }

    // ✅ Wait for categories to load - don't show "All Courses" fallback
    // Categories should be loaded by now, but if not, return empty to show skeleton
    if (categoriesArray.length === 0) {
      return { finalCategories: [], visibleCount: 0 };
    }

    // Create a map for faster lookups instead of multiple filters
    const coursesByCategory = new Map();
    coursesArray.forEach(course => {
      const catId = course.category_id;
      if (catId !== undefined && catId !== null) {
        if (!coursesByCategory.has(catId)) {
          coursesByCategory.set(catId, []);
        }
        coursesByCategory.get(catId)?.push(course);
      }
    });

    let grouped = categoriesArray
      .map(cat => ({
        ...cat,
        courses: coursesByCategory.get(cat.id) || [],
      }))
      .filter(g => g.courses.length > 0);

    // URL CATEGORY MODE
    if (catQuery) {
      const match = categoriesArray.find(c => c.name?.toLowerCase() === catQuery);
      grouped = match ? grouped.filter(g => g.id === match.id) : [];
    }

    // SEARCH FILTER - optimize with Map for faster lookups
    if (isSearchMode && q.length > 0) {
      const searchLower = q.toLowerCase();
      const matched = coursesArray.filter(c => {
        const title = (c.title || '').toLowerCase();
        const desc = (c.description || '').toLowerCase();
        const status = (c.status || '').toLowerCase();
        return (
          title.includes(searchLower) || desc.includes(searchLower) || status.includes(searchLower)
        );
      });

      // Use Map for faster category grouping
      const matchedByCategory = new Map();
      matched.forEach(course => {
        const catId = course.category_id;
        if (catId !== undefined && catId !== null) {
          if (!matchedByCategory.has(catId)) {
            matchedByCategory.set(catId, []);
          }
          matchedByCategory.get(catId)?.push(course);
        }
      });

      grouped = grouped
        .map(cat => ({
          ...cat,
          courses: matchedByCategory.get(cat.id) || [],
        }))
        .filter(cat => cat.courses.length > 0);
    }

    // VIEW ALL MODE
    if (forcedCategory) {
      grouped = grouped.filter(g => g.name.toLowerCase() === forcedCategory.toLowerCase());
    }

    // APPLY CATEGORY FILTER (checkboxes)
    const final =
      isSearchMode || forcedCategory || catQuery || selectedCats.includes('all')
        ? grouped
        : grouped.filter(cat => selectedCats.includes(String(cat.id)));

    const count = final.reduce((sum, cat) => sum + cat.courses.length, 0);

    return { finalCategories: final, visibleCount: count };
  }, [courses, categories, q, catQuery, isSearchMode, forcedCategory, selectedCats, urlStatus, coursesLoaded, categoriesLoaded]);

  // Render immediately with empty state to improve FCP and LCP
  // Don't block render - show structure immediately

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-6 sm:pt-6 sm:pb-8 pb-24 sm:pb-40">
      {/* Safe bottom padding for sticky footer + floating buttons */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* ⭐ SIDEBAR - Hide in view-all mode, sticky until end of courses */}
        {!forcedCategory && (
          <aside className="lg:w-64 lg:flex-shrink-0 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-80px)]">
            <CategorySidebar
              categories={categories}
              selected={selectedCats}
              isSearchMode={isSearchMode}
              totalResults={visibleCount}
              onChange={handleCategorySelect}
            />
          </aside>
        )}

         {/* ⭐ MAIN CONTENT - Vertical category sections with scroll */}
         <main className="flex-1 min-w-0 relative lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto lg:pr-2 scrollbar-hidden">
           {loading && !coursesLoaded ? (
             // Show skeleton only on initial load
            <CourseSkeletonLoader />
          ) : finalCategories.length > 0 ? (
             // Show courses when available
            <div className="space-y-6 sm:space-y-8 lg:space-y-10">
              {finalCategories.map((category, index) => (
                <CourseRow
                  key={category.id}
                  title={category.name}
                  courses={category.courses}
                  disableArrows={Boolean(catQuery || forcedCategory)}
                  onBack={() => setForcedCategory('')}
                  isFirst={index === 0}
                />
              ))}
            </div>
           ) : coursesLoaded ? (
             // Only show empty state after courses have been loaded at least once
             <EmptyState />
          ) : (
             // Show nothing while initial loading
             null
          )}
        </main>
      </div>
    </div>
  );
}
