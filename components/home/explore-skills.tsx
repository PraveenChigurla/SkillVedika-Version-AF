'use client';

import { useState } from 'react';
import parse from 'html-react-parser';

export default function ExploreSkills({ explore, setStatusFilter }) {
  const [activeTab, setActiveTab] = useState(
    explore?.explore_tabs?.[0]?.toLowerCase() || 'trending'
  );

  const tabs = explore?.explore_tabs || ['Trending', 'Popular', 'Free'];

  const handleTab = (tab: string) => {
    const key = tab.toLowerCase();
    setActiveTab(key);
    setStatusFilter(key);
  };

  return (
    <section className="pt-16 md:pt-20 pb-0 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* ⭐ Dynamic Heading (HTML + JSX parser) */}
        <div className="mb-2">
          {explore?.explore_heading ? parse(explore.explore_heading) : null}
        </div>

        {/* ⭐ Dynamic Description */}
        <div className="text-gray-600 text-sm md:text-base mb-12">
          {explore?.explore_content ? parse(explore.explore_content) : null}
        </div>

        {/* ⭐ Dynamic Tabs */}
        <div className="flex justify-center">
          <div className="flex bg-white border border-gray-300 rounded-full shadow-sm px-2 py-1">
            {tabs.map((tab: string) => (
              <button
                key={tab}
                onClick={() => handleTab(tab)}
                className={`px-8 py-2 rounded-full text-base font-medium transition-all ${
                  activeTab === tab.toLowerCase()
                    ? 'bg-[#2C5AA0] text-white shadow-md'
                    : 'text-gray-800 hover:text-[#2C5AA0]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
