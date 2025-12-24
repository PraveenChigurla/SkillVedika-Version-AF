'use client';

import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';

interface Category {
  id: string | number;
  name: string;
}

interface CategoryFilterBarProps {
  categories: Category[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function CategoryFilterBar({ categories, selected, onChange }: Readonly<CategoryFilterBarProps>) {
  const router = useRouter();
  const params = useSearchParams();

  // Remove search + category from URL and update UI filters
  const applySelection = (newSelected: string[]) => {
    const query = new URLSearchParams(params.toString());

    query.delete('search'); // ❗ Remove search filter completely
    query.delete('category'); // ❗ Remove category URL filter too

    router.replace(`/courses?${query.toString()}`); // update URL (no reload)
    onChange(newSelected); // update UI state
  };

  const toggleCategory = (id: string | number) => {
    let updated = [...selected];
    const idStr = String(id);

    // If user selects ALL
    if (idStr === 'all') {
      applySelection(['all']);
      return;
    }

    // Remove ALL when selecting individuals
    updated = updated.filter(x => x !== 'all');

    // Toggle indiv category
    if (updated.includes(idStr)) {
      updated = updated.filter(x => x !== idStr);
    } else {
      updated.push(idStr);
    }

    if (updated.length === 0) updated = ['all'];

    applySelection(updated);
  };

  return (
    <div className="mb-10">
      <div className="flex flex-wrap justify-center gap-4">
        {/* ALL checkbox */}
        <motion.label
          whileHover={{ scale: 1.03 }}
          className={`cursor-pointer px-4 py-2 rounded-full border flex items-center gap-2 text-sm
            ${
              selected.includes('all')
                ? 'bg-[#2C5AA0] text-white border-[#2C5AA0]'
                : 'bg-[#F3F6FC] text-gray-700 border-gray-300'
            }`}
        >
          <input
            type="checkbox"
            checked={selected.includes('all')}
            onChange={() => toggleCategory('all')}
            className="accent-[#2C5AA0]"
          />
          All
        </motion.label>

        {/* Individual CATEGORY checkboxes */}
        {categories.map(cat => {
          const catIdStr = String(cat.id);
          return (
            <motion.label
              key={cat.id}
              whileHover={{ scale: 1.03 }}
              className={`cursor-pointer px-4 py-2 rounded-full border flex items-center gap-2 text-sm
                ${
                  selected.includes(catIdStr)
                    ? 'bg-[#2C5AA0] text-white border-[#2C5AA0]'
                    : 'bg-[#F3F6FC] text-gray-700 border-gray-300'
                }`}
            >
              <input
                type="checkbox"
                checked={selected.includes(catIdStr)}
                onChange={() => toggleCategory(cat.id)}
                className="accent-[#2C5AA0]"
              />
              {cat.name}
            </motion.label>
          );
        })}
      </div>
    </div>
  );
}
