'use client';

import { useEffect, useState, startTransition } from 'react';

export default function CategorySidebar({
  categories,
  selected,
  onChange,
  totalResults,
  isSearchMode,
}) {
  const [heading, setHeading] = useState('Categories');

  // Defer non-critical API call to avoid blocking render
  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

    fetch(process.env.NEXT_PUBLIC_API_URL + '/course-page-content', {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        startTransition(() => {
          setHeading(data.sidebar_heading || 'Categories');
        });
      })
      .catch(() => {
        // Silently fail - use default heading
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });
  }, []);

  return (
    <aside className="bg-white rounded-3xl shadow p-6 w-64 h-[1150px] flex flex-col sticky top-24">
      <h3 className="text-lg font-semibold text-gray-900 mb-5">{heading}</h3>

      <div className="space-y-3 max-h-[950px] overflow-y-auto pr-2">
        {/* ALL */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 accent-[#1E5BA8]"
            checked={!isSearchMode && selected.includes('all')}
            onChange={() => onChange('all')}
          />
          <span className="text-sm text-gray-800">All</span>
        </label>

        {/* CATEGORY LIST */}
        {categories.map(cat => (
          <label key={cat.id} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 accent-[#1E5BA8]"
              checked={!isSearchMode && selected.includes(String(cat.id))}
              onChange={() => onChange(String(cat.id))}
            />
            <span className="text-sm text-gray-800">{cat.name}</span>
          </label>
        ))}
      </div>

      <p className="mt-6 text-sm text-gray-700">{totalResults} Courses</p>
    </aside>
  );
}
