'use client';

import { useState } from 'react';
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
  const [statusFilter, setStatusFilter] = useState('trending');

  return (
    <>
      <ExploreSkills explore={explore} setStatusFilter={setStatusFilter} />
      <CourseCards statusFilter={statusFilter} />
    </>
  );
}
