'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getTitleParts } from '@/utils/getTitle';
import SafeHTML from '@/components/SafeHTML';

export default function RealTime({
  title,
  subheading,
  description,
  subsection1Title,
  subsection1Desc,
  subsection2Title,
  subsection2Desc,
  imagePath,
}: {
  title: any;
  subheading: string;
  description: string;
  subsection1Title: string;
  subsection1Desc: string;
  subsection2Title: string;
  subsection2Desc: string;
  imagePath: string;
}) {
  const IMAGE_SCALE = 0.75;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative bg-gradient-to-b from-white to-white py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-20 left-10 w-56 h-56 bg-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-300/20 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-16">
          {/* LEFT IMAGE */}
          <div
            className={`flex justify-center lg:justify-start w-full lg:w-[45%] transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
          >
            <div className="relative w-[380px] h-[380px] flex items-center justify-center group">
              <div className="absolute inset-0 bg-blue-400/15 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-300/30 to-indigo-400/30 rounded-full animate-float"></div>
              <div className="absolute inset-4 bg-white/90 rounded-full shadow-[0_10px_35px_-10px_rgba(30,64,175,0.25)] backdrop-blur-xl"></div>

              <div
                className="relative z-10 w-[260px] h-[260px] rounded-full overflow-hidden shadow-xl transition-transform duration-500 hover:scale-105 animate-pop-slow"
                style={{ transform: `scale(${IMAGE_SCALE})`, transformOrigin: 'center' }}
              >
                <Image
                  src={imagePath || '/on-job-support/Frame 276.png'}
                  alt="Real-Time Help"
                  width={260}
                  height={260}
                  className="object-contain"
                  style={{ width: '100%', height: '100%' }}
                  unoptimized={typeof imagePath === 'string' && imagePath.includes('res.cloudinary.com')}
                  quality={85}
                  loading="lazy"
                  sizes="(max-width: 768px) 260px, 260px"
                />
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div
            className={`w-full lg:w-[55%] space-y-8 transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            <div className="space-y-3">
              <h2 className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent leading-tight">
                {(() => {
                  const { part1, part2 } = getTitleParts(title);
                  if (!part1 && !part2) return 'Real-Time Project Help';
                  if (part2) {
                    return (
                      <>
                        {part1} <span className="text-teal-500">{part2}</span>
                      </>
                    );
                  }
                  return part1;
                })()}
              </h2>

              <h3 className="text-3xl lg:text-4xl font-semibold text-gray-900">
                {subheading || 'From Industry Experts'}
              </h3>
            </div>

            <div className="h-1 w-30 bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full"></div>

            {/* DESCRIPTION (TipTap HTML) */}
            <SafeHTML
              html={description || ''}
              className="text-gray-600 text-lg leading-relaxed max-w-2xl"
            />

            {/* Highlight features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              {/* Feature 1 */}
              <div className="flex items-start gap-4 group">
                <div className="w-3 h-3 bg-blue-600 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {subsection1Title || 'Expert Guidance'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {subsection1Desc || 'Industry professionals at your service'}
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-4 group">
                <div className="w-3 h-3 bg-blue-600 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {subsection2Title || 'Instant Solutions'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {subsection2Desc || 'Real-time problem solving'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animation */}
      <style jsx>{`
        @keyframes pop-slow {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.07);
          }
        }
        .animate-pop-slow {
          animation: pop-slow 5s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
