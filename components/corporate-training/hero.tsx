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
  buttonLink,
  imagePath,
  courses = [],
}: {
  titlePart1: string;
  titleHighlight: string;
  subheading: string;
  buttonText: string;
  buttonLink: string;
  imagePath: string;
  courses?: { id: number; title: string }[];
}) {
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#E8F0F7] to-[#F0F4F9] py-20 md:py-24">
      {/* === Hero Content === */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Content */}
        <div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {titlePart1} <span className="text-blue-900">{titleHighlight}</span>
          </h1>

          <p className="text-lg text-gray-600 mb-8 max-w-lg">{subheading}</p>

          <div className="flex flex-wrap gap-4">
            {buttonLink ? (
              <a href={buttonLink}>
                <button
                  className="px-8 py-3 bg-blue-800 text-white rounded-lg font-semibold shadow hover:bg-[#0066d3] transition-transform hover:scale-105 active:scale-95"
                >
                  {buttonText}
                </button>
              </a>
            ) : (
              <button
                onClick={() => setShowEnrollModal(true)}
                className="px-8 py-3 bg-blue-800 text-white rounded-lg font-semibold shadow hover:bg-[#0066d3] transition-transform hover:scale-105 active:scale-95"
              >
                {buttonText}
              </button>
            )}
          </div>

          {showEnrollModal && (
            <EnrollModal
              courses={courses}
              page="Corporate Training"
              onClose={() => setShowEnrollModal(false)}
            />
          )}
        </div>

        {/* Right Image */}
        <div className="relative flex justify-center items-center">
          {/* Removed expensive blur effect for better performance */}
          <div className="relative z-10">
            <Image
              src={imagePath || '/corporate training/Frame 1.png'}
              alt="Corporate Training Illustration"
              width={500}
              height={500}
              className="object-contain"
              priority
              quality={75}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 500px"
              style={{ width: 'auto', height: 'auto' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
