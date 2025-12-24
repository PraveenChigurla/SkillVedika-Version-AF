'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function HomePageSkeleton() {
  return (
    <main className="min-h-screen bg-[#F0F4F9]">
      {/* Hero Section Skeleton */}
      <section className="bg-gradient-to-br from-[#E8F0F7] to-[#F0F4F9] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="space-y-4">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-2/3" />
              </div>

              <div className="flex flex-wrap gap-4">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-6 w-24" />
                ))}
              </div>

              {/* Search Bar Skeleton */}
              <div className="pt-4">
                <div className="flex gap-2">
                  <Skeleton className="flex-1 h-12 rounded-md" />
                  <Skeleton className="w-16 h-12 rounded-md" />
                </div>
              </div>

              {/* Popular Tags Skeleton */}
              <div className="pt-4">
                <Skeleton className="h-6 w-32 mb-2" />
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-6 w-20 rounded-full" />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="hidden md:flex justify-center">
              <Skeleton className="w-[400px] h-[400px] rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Explore Skills Skeleton */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 mb-8">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-10 w-24 rounded-md" />
            ))}
          </div>
        </div>
      </section>

      {/* Course Cards Skeleton */}
      <section className="py-12 bg-[#F0F4F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
                <Skeleton className="w-full h-48" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex justify-between items-center pt-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-28 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Skeleton */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-64 mx-auto mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="text-center space-y-4">
                <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Assistance Skeleton */}
      <section className="py-20 md:py-28 bg-[#F4F8FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-80 mx-auto mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg space-y-3">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Blog Skeleton */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
                <Skeleton className="w-full h-48" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
