'use client';

import { useEffect, useState, startTransition, useMemo } from 'react';
import dynamic from 'next/dynamic';
import CourseRow from './CourseRow';
import type { Course } from '@/types/api';

// Lazy load CategorySidebar - it's not critical for initial render
const CategorySidebar = dynamic(() => import('./CategorySidebar'), {
  loading: () => <div className="w-64 h-96 bg-gray-50 rounded-lg animate-pulse"></div>,
});

interface Category {
  id: string | number;
  name: string;
}

export default function CourseGrid({ searchQuery = '', urlCategory = '' }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

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
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        // Defer categories fetch - sidebar is lazy loaded, not critical for initial render
        // Use requestIdleCallback to defer if available
        const fetchCategories = async () => {
          const catRes = (await Promise.race([
            fetch(`${apiBase}/categories`, {
              signal: controller.signal,
              headers: { Accept: 'application/json' },
              cache: 'default', // Browser cache
            }),
            new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1500)), // Reduced timeout
          ]).catch(() => ({ ok: false } as Response))) as Response | { ok: false };

          // Set categories with startTransition for non-blocking update
          if (catRes.ok && 'json' in catRes) {
            try {
              const data = await (catRes as Response).json();
              const categoriesData = data?.data || data || [];
              startTransition(() => {
                setCategories(Array.isArray(categoriesData) ? categoriesData : []);
              });
            } catch (e) {
              console.warn('Failed to parse categories:', e);
              startTransition(() => {
                setCategories([]);
              });
            }
          } else {
            startTransition(() => {
              setCategories([]);
            });
          }
        };

        // Defer categories fetch to reduce initial TBT
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          requestIdleCallback(fetchCategories, { timeout: 1000 });
        } else {
          setTimeout(fetchCategories, 100);
        }

        // Fetch courses immediately (needed for LCP) - optimized with shorter timeout
        const courseRes = (await Promise.race([
          fetch(`${apiBase}/courses`, {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
            // Use browser cache - client components can't use Next.js cache options
            cache: 'default', // Browser will use cache if available
          }),
          new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000)), // Reduced to 2s
        ]).catch(() => ({ ok: false } as Response))) as Response | { ok: false };

        clearTimeout(timeoutId);

        // Handle courses with startTransition for non-blocking update
        let coursesData = [];
        if (courseRes.ok && 'json' in courseRes) {
          try {
            const data = await (courseRes as Response).json();
            coursesData = data?.data || data || [];
          } catch (e) {
            console.warn('Failed to parse courses:', e);
          }
        }

        // Use startTransition for non-urgent state updates to reduce TBT
        startTransition(() => {
          setCourses(Array.isArray(coursesData) ? coursesData : []);
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
    const coursesArray = Array.isArray(courses) ? courses : [];
    const categoriesArray = Array.isArray(categories) ? categories : [];

    // Early return if no data to avoid unnecessary computation
    if (coursesArray.length === 0 || categoriesArray.length === 0) {
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
  }, [courses, categories, q, catQuery, isSearchMode, forcedCategory, selectedCats]);

  // Render immediately with empty state to improve FCP and LCP
  // Don't block render - show structure immediately

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-5 py-0">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* ⭐ HIDE SIDEBAR IN VIEW-ALL MODE */}
        {!forcedCategory && (
          <CategorySidebar
            categories={categories}
            selected={selectedCats}
            isSearchMode={isSearchMode}
            totalResults={visibleCount}
            onChange={handleCategorySelect}
          />
        )}

        {/* ⭐ FULL WIDTH WHEN SIDEBAR HIDDEN */}
        <div className={forcedCategory ? 'col-span-4' : 'md:col-span-3'}>
          {loading && finalCategories.length === 0 ? (
            <div className="py-20 text-center text-gray-600">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-4">Loading courses...</p>
            </div>
          ) : finalCategories.length > 0 ? (
            finalCategories.map(category => (
              <CourseRow
                key={category.id}
                title={category.name}
                courses={category.courses}
                disableArrows={Boolean(catQuery || forcedCategory)}
                onViewAll={title => setForcedCategory(title)}
                onBack={() => setForcedCategory('')}
              />
            ))
          ) : (
            <div className="text-center py-20 text-gray-600">No courses match your filters.</div>
          )}
        </div>
      </div>
    </div>
  );
}
