'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

// Client components that need state
const ExploreSkills = dynamic(() => import('@/components/home/explore-skills'), {
  ssr: true,
});
const CourseCards = dynamic(() => import('@/components/home/course-cards'), {
  ssr: true,
});

interface HomePageClientProps {
  explore: any;
}

export default function HomePageClient({ explore }: HomePageClientProps) {
  const searchParams = useSearchParams();
  const statusFromUrl = searchParams?.get('status') || 'trending';
  const [statusFilter, setStatusFilter] = useState(statusFromUrl);

  // Update filter when URL changes
  useEffect(() => {
    const urlStatus = searchParams?.get('status');
    if (urlStatus) {
      setStatusFilter(urlStatus);
    }
  }, [searchParams]);

  // Scroll to courses section when status parameter is present
  useEffect(() => {
    const urlStatus = searchParams?.get('status');
    if (urlStatus) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.getElementById('trending-courses-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [searchParams]);

  return (
    <>
      <ExploreSkills explore={explore} setStatusFilter={setStatusFilter} initialStatus={statusFilter} />
      <div id="trending-courses-section">
        <CourseCards statusFilter={statusFilter} />
      </div>
    </>
  );
}
