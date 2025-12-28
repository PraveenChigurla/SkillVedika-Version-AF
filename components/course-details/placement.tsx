'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { getApiUrl } from '@/lib/apiConfig';
import { logger } from '@/lib/logger';
import type { PlacementsReserveContent } from '@/types/api';

export default function Placement() {
  const [content, setContent] = useState<PlacementsReserveContent | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const apiUrl = getApiUrl('/placements-reserve');

    fetch(apiUrl, {
      headers: {
        Accept: 'application/json',
      },
    })
      .then(res => {
        if (!res.ok) {
          logger.warn('Placement API error:', res.status);
          return null;
        }
        return res.json();
      })
      .then(response => {
        if (!response) {
          setContent(null);
          return;
        }
        // Backend returns a direct object (not wrapped in {success, data})
        setContent(response as PlacementsReserveContent);
      })
      .catch(err => {
        logger.error('Placement API error:', err);
        setContent(null);
      });
  }, []);

  useEffect(() => {
    if (
      !content?.placement_images ||
      !Array.isArray(content.placement_images) ||
      content.placement_images.length === 0
    ) {
      return;
    }

    const interval = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % content.placement_images!.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [content]);

  if (!content) return null;

  // Ensure placement_images exists and is an array
  const placementImages = content.placement_images || [];
  const images = Array.isArray(placementImages)
    ? placementImages.map(url => ({
        src: url,
        alt: 'Company Logo',
      }))
    : [];

  // Don't render if there are no images
  if (images.length === 0) return null;

  return (
    <section className="relative bg-gradient-to-b from-blue-50 via-blue-100/30 to-purple-50 px-6 py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(59,130,246,0.12),transparent_50%),radial-gradient(circle_at_70%_20%,rgba(168,85,247,0.1),transparent_40%)] animate-pulse"></div>

      <div className="relative max-w-6xl mx-auto text-center">
        {/* Dynamic Header */}
        {(content.placements_title?.main || content.title) && (
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            {content.placements_title?.main || content.title || 'Placement Partners'}
          </h2>
        )}

        {(content.placements_subtitle || content.description) && (
          <p className="text-gray-600 mb-14 text-base">
            {content.placements_subtitle || content.description || ''}
          </p>
        )}

        {/* Carousel */}
        <div className="relative flex justify-center items-center h-48 md:h-56">
          {images.map((logo, idx) => {
            const prevIdx = (activeIdx - 1 + images.length) % images.length;
            const nextIdx = (activeIdx + 1) % images.length;

            const isActive = idx === activeIdx;
            const isPrev = idx === prevIdx;
            const isNext = idx === nextIdx;

            let positionClass: string;
            const motionProps: Record<string, unknown> = {};

            if (isActive) {
              positionClass = 'z-20 scale-125';
              Object.assign(motionProps, {
                initial: { opacity: 0, scale: 0.8, y: 20 },
                animate: { opacity: 1, scale: 1.25, y: 0 },
                exit: { opacity: 0, scale: 0.8, y: -20 },
              });
            } else if (isPrev) {
              positionClass = 'absolute left-[10%] z-10 scale-90 opacity-60';
              Object.assign(motionProps, {
                initial: { opacity: 0, x: -100 },
                animate: { opacity: 0.6, x: 0 },
                exit: { opacity: 0, x: -100 },
              });
            } else if (isNext) {
              positionClass = 'absolute right-[10%] z-10 scale-90 opacity-60';
              Object.assign(motionProps, {
                initial: { opacity: 0, x: 100 },
                animate: { opacity: 0.6, x: 0 },
                exit: { opacity: 0, x: 100 },
              });
            } else {
              positionClass = 'opacity-0 pointer-events-none';
            }

            return (
              <AnimatePresence key={`logo-${logo.src}`}>
                {(isActive || isPrev || isNext) && (
                  <motion.div
                    key={`motion-${logo.src}`}
                    {...motionProps}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className={`absolute flex justify-center items-center w-48 md:w-56 lg:w-60 ${positionClass}`}
                  >
                    <div
                      className={`bg-white/70 backdrop-blur-md p-4 md:p-6 rounded-2xl shadow-lg border border-white/60 transition-all duration-500 ${
                        idx === activeIdx ? 'scale-110 shadow-blue-200 drop-shadow-xl' : 'shadow-md'
                      }`}
                    >
                      <Image
                        src={logo.src}
                        alt={logo.alt}
                        width={180}
                        height={100}
                        className="object-contain mx-auto"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            );
          })}
        </div>

        {/* Dots - Non-interactive indicators */}
        <div className="flex justify-center gap-2 mt-10">
          {images.map((logo, idx) => (
            <div
              key={`dot-${logo.src}-${idx}`}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-default ${
                idx === activeIdx ? 'bg-blue-600 scale-110' : 'bg-gray-300'
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
