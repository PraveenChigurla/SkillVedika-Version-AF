'use client';

import { useState, useEffect } from 'react';
import parse from 'html-react-parser';

interface ExploreSkillsProps {
  explore?: any;
  setStatusFilter: (filter: string) => void;
  initialStatus?: string;
}

export default function ExploreSkills({ explore, setStatusFilter, initialStatus = 'trending' }: Readonly<ExploreSkillsProps>) {
  const [activeTab, setActiveTab] = useState(
    initialStatus || explore?.explore_tabs?.[0]?.toLowerCase() || 'trending'
  );

  const tabs = explore?.explore_tabs || ['Trending', 'Popular', 'Free'];

  // Sync activeTab with initialStatus prop
  useEffect(() => {
    if (initialStatus) {
      setActiveTab(initialStatus);
      setStatusFilter(initialStatus);
    }
  }, [initialStatus, setStatusFilter]);

  const handleTab = (tab: string) => {
    const key = tab.toLowerCase();
    setActiveTab(key);
    setStatusFilter(key);
  };

  return (
    <section className="pt-12 sm:pt-16 md:pt-20 pb-0 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* ⭐ Dynamic Heading (HTML + JSX parser) */}
        <div className="mb-2 px-2">
          {explore?.explore_heading ? parse(explore.explore_heading) : null}
        </div>

        {/* ⭐ Dynamic Description */}
        <div className="text-gray-600 text-sm sm:text-base mb-8 sm:mb-12 px-2">
          {explore?.explore_content ? parse(explore.explore_content) : null}
        </div>

        {/* ⭐ Dynamic Tabs */}
        <div className="flex justify-center px-2">
          <div className="flex bg-white border border-gray-300 rounded-full shadow-sm px-1 sm:px-2 py-1 flex-wrap justify-center gap-1">
            {tabs.map((tab: string) => (
              <button
                key={tab}
                onClick={() => handleTab(tab)}
                className={`px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-medium transition-all min-h-[44px] ${
                  activeTab === tab.toLowerCase()
                    ? 'bg-[#2C5AA0] text-white shadow-md'
                    : 'text-gray-800 hover:text-[#2C5AA0] active:bg-gray-100'
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
