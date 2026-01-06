'use client';

import Image from 'next/image';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Lazy load EnrollModal to reduce initial bundle size
const EnrollModal = dynamic(
  () => import('../EmptyLoginForm').then(mod => ({ default: mod.EnrollModal })),
  {
    ssr: false,
  }
);

export default function Hero({
  titlePart1,
  titleHighlight,
  subheading,
  buttonText,
  imagePath,
  courses = [],
}: Readonly<{
  titlePart1: string;
  titleHighlight: string;
  subheading: string;
  buttonText: string;
  imagePath: string;
  courses?: { id: number; title: string }[];
  buttonLink?: string; // Accept but ignore
}>) {
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#E8F0F7] to-[#F0F4F9] py-10 sm:py-14 lg:py-20">
      {/* === Hero Content === */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-16 items-center">
          {/* Left Content - Text First on Mobile */}
          <div className="w-full lg:w-1/2 order-2 lg:order-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              {titlePart1} <span className="text-blue-900">{titleHighlight}</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8 max-w-lg leading-relaxed">
              {subheading}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => setShowEnrollModal(true)}
                className="w-full sm:w-auto px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 bg-blue-800 text-white rounded-lg font-semibold shadow hover:bg-[#0066d3] active:bg-[#0052a3] transition-colors min-h-[44px] flex items-center justify-center text-sm sm:text-base"
              >
                {buttonText}
              </button>
            </div>

            {showEnrollModal && (
              <EnrollModal
                courses={courses}
                page="Corporate Training"
                onClose={() => setShowEnrollModal(false)}
              />
            )}
          </div>

          {/* Right Image - Image First on Mobile */}
          <div className="relative flex justify-center items-center w-full lg:w-1/2 order-1 lg:order-2">
            <div className="relative w-full max-w-[280px] sm:max-w-[350px] md:max-w-[400px] lg:max-w-[500px] aspect-square flex items-center justify-center">
              <Image
                src={imagePath || '/corporate training/Frame 1.png'}
                alt="Corporate Training Illustration"
                width={500}
                height={500}
                className="object-contain w-full h-full"
                priority
                quality={75}
                sizes="(max-width: 640px) 280px, (max-width: 768px) 350px, (max-width: 1024px) 400px, 500px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
