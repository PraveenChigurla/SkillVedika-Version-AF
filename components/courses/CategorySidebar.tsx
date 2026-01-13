// 'use client';

// import { useEffect, useState, startTransition } from 'react';

// interface Category {
//   id: string | number;
//   name: string;
// }

// interface CategorySidebarProps {
//   categories: Category[];
//   selected: string[];
//   onChange: (value: string) => void;
//   totalResults: number;
//   isSearchMode?: boolean;
// }

// export default function CategorySidebar({
//   categories,
//   selected,
//   onChange,
//   totalResults,
//   isSearchMode,
// }: Readonly<CategorySidebarProps>) {
//   const [heading, setHeading] = useState('Categories');

//   // Defer non-critical API call to avoid blocking render
//   useEffect(() => {
//     const controller = new AbortController();
//     const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

//     fetch(process.env.NEXT_PUBLIC_API_URL + '/course-page-content', {
//       signal: controller.signal,
//       headers: { Accept: 'application/json' },
//     })
//       .then(res => {
//         if (!res.ok) throw new Error('Failed to fetch');
//         return res.json();
//       })
//       .then(data => {
//         startTransition(() => {
//           setHeading(data.sidebar_heading || 'Categories');
//         });
//       })
//       .catch(() => {
//         // Silently fail - use default heading
//       })
//       .finally(() => {
//         clearTimeout(timeoutId);
//       });
//   }, []);

//   return (
//     <aside className="bg-white rounded-3xl shadow p-6 w-64 h-[1150px] flex flex-col sticky top-24">
//       <h3 className="text-lg font-semibold text-gray-900 mb-5">{heading}</h3>

//       <div className="space-y-3 max-h-[950px] overflow-y-auto pr-2">
//         {/* ALL */}
//         <label className="flex items-center gap-3 cursor-pointer">
//           <input
//             type="checkbox"
//             className="w-4 h-4 accent-[#1E5BA8]"
//             checked={!isSearchMode && selected.includes('all')}
//             onChange={() => onChange('all')}
//           />
//           <span className="text-sm text-gray-800">All</span>
//         </label>

//         {/* CATEGORY LIST */}
//         {categories.map(cat => (
//           <label key={cat.id} className="flex items-center gap-3 cursor-pointer">
//             <input
//               type="checkbox"
//               className="w-4 h-4 accent-[#1E5BA8]"
//               checked={!isSearchMode && selected.includes(String(cat.id))}
//               onChange={() => onChange(String(cat.id))}
//             />
//             <span className="text-sm text-gray-800">{cat.name}</span>
//           </label>
//         ))}
//       </div>

//       <p className="mt-6 text-sm text-gray-700">{totalResults} Courses</p>
//     </aside>
//   );
// }




'use client';

import { useEffect, useState, startTransition, memo, useCallback } from 'react';
import { X, Filter, ChevronDown, ChevronUp } from 'lucide-react';

interface Category {
  id: string | number;
  name: string;
}

interface CategorySidebarProps {
  categories: Category[];
  selected: string[];
  onChange: (value: string) => void;
  totalResults: number;
  isSearchMode?: boolean;
}

function CategorySidebar({
  categories,
  selected,
  onChange,
  totalResults,
  isSearchMode,
}: Readonly<CategorySidebarProps>) {
  const [heading, setHeading] = useState('Categories');
  const [isOpen, setIsOpen] = useState(false); // Mobile drawer state
  const [isCollapsed, setIsCollapsed] = useState(false); // Tablet collapse state
  const [isFiltering, setIsFiltering] = useState(false); // Visual feedback for filter changes

  // Non-blocking heading fetch
  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    fetch(process.env.NEXT_PUBLIC_API_URL + '/course-page-content', {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!data) return;
        startTransition(() => {
          setHeading(data.sidebar_heading || 'Categories');
        });
      })
      .catch(() => {})
      .finally(() => clearTimeout(timeoutId));
  }, []);

  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Prevent body scroll when drawer is open
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

  // Handle filter change with instant visual feedback
  const handleFilterChange = useCallback((value: string) => {
    setIsFiltering(true);
    onChange(value);
    // Reset visual feedback after a short delay
    setTimeout(() => setIsFiltering(false), 150);
  }, [onChange]);

  const sidebarContent = (
    <>
      {/* Heading */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
        {heading}
      </h3>
        {/* Tablet collapse button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="lg:hidden p-1 hover:bg-gray-100 rounded transition-colors"
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

      {/* Category list */}
      <div
        className={`
          space-y-1.5 overflow-y-auto pr-2 flex-1 min-h-0
          transition-all duration-300
          ${isCollapsed ? 'max-h-0 overflow-hidden' : ''}
          ${isFiltering ? 'opacity-75' : 'opacity-100'}
        `}
        style={{
          maxHeight: isCollapsed ? '0' : 'calc(100vh - 280px)',
        }}
      >
        {/* ALL */}
        <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 p-2 rounded-md transition-colors -ml-2 -mr-2">
          <input
            type="checkbox"
            className="w-4 h-4 accent-[#1E5BA8] cursor-pointer"
            checked={!isSearchMode && selected.includes('all')}
            onChange={() => handleFilterChange('all')}
            aria-label="Select all categories"
          />
          <span className="text-sm text-gray-800 select-none font-medium">
            All
          </span>
        </label>

        {/* CATEGORY LIST */}
        {categories.map(cat => (
          <label
            key={cat.id}
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 p-2 rounded-md transition-colors -ml-2 -mr-2"
          >
            <input
              type="checkbox"
              className="w-4 h-4 accent-[#1E5BA8] cursor-pointer"
              checked={!isSearchMode && selected.includes(String(cat.id))}
              onChange={() => handleFilterChange(String(cat.id))}
              aria-label={`Select ${cat.name} category`}
            />
            <span className="text-sm text-gray-800 select-none">
              {cat.name}
            </span>
          </label>
        ))}
      </div>

      {/* Footer - Show count with animation */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{totalResults}</span>{' '}
          {totalResults === 1 ? 'Course' : 'Courses'}
        </p>
      </div>
    </>
  );

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
          <h3 className="text-lg font-semibold text-gray-900">{heading}</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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

      {/* Tablet/Desktop: Sidebar */}
      <aside
        className={`
          hidden lg:block
          bg-white rounded-2xl shadow-sm border border-gray-200 p-5
          w-full
          flex flex-col
          h-fit
          max-h-[calc(100vh-120px)]
        `}
        aria-label="Category filters"
      >
        {sidebarContent}
    </aside>

      {/* Mobile: Modern Filter Button - Top positioned, non-sticky */}
      <div className="lg:hidden relative mb-4 h-12 flex items-center justify-end">
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-gradient-to-r from-[#1E5BA8] to-[#2563EB] text-white px-5 py-3 rounded-2xl shadow-xl hover:shadow-2xl flex items-center gap-2.5 hover:from-[#1A3F66] hover:to-[#1E40AF] active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#1E5BA8] focus:ring-offset-2 backdrop-blur-sm border border-white/20 group"
          aria-label="Open filters"
        >
          <div className="relative">
            <Filter className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
            {selected.length > 0 && selected[0] !== 'all' && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-lg animate-pulse">
                {selected.length}
              </span>
            )}
          </div>
          <span className="font-semibold text-sm tracking-wide">Filters</span>
          {selected.length > 0 && selected[0] !== 'all' && (
            <span className="bg-white/20 backdrop-blur-sm text-white rounded-lg px-2.5 py-1 text-xs font-bold min-w-[24px] text-center border border-white/30">
              {selected.length}
            </span>
          )}
        </button>
      </div>
    </>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(CategorySidebar);
