'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';
import { getTitleParts } from '@/utils/getTitle'; // add at top

export default function WhyChoose({
  title,
  points,
  image,
}: {
  title: any;
  points: string[];
  image: string;
}) {
  const slideRange = 150;
  const slideSpeed = 4;
  const rightSectionOffset = -50;

  const ringOffset = { x: -290, y: -60 };
  const glowOffset = { x: -150, y: -60 };

  const x = useMotionValue(-slideRange);
  const glowOpacity = useTransform(x, [-slideRange, 0, slideRange], [0, 0.2, 0.6]);

  // Extract title parts
  const { part1, part2 } = getTitleParts(title);

  useEffect(() => {
    // Defer animation start to reduce initial TBT
    let controls: any;
    const timeoutId = setTimeout(() => {
      controls = animate(x, [-slideRange, slideRange, -slideRange], {
        duration: slideSpeed,
        repeat: Infinity,
        ease: 'easeInOut',
      });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (controls) controls.stop();
    };
  }, [x]);

  return (
    <section className="relative bg-gradient-to-b from-white to-white py-24 px-6 sm:px-10 lg:px-16 overflow-hidden">
      <div className="absolute top-16 left-20 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-24 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-float" />

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10">
        {/* LEFT — TEXT */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="w-full lg:w-[60%]"
        >
          {/* replace the current <h2> with: */}
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-snug">
            {part1 || 'Why Choose'}{' '}
            <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              {part2 || 'SkillVedika?'}
            </span>
          </h2>

          <ul className="space-y-5">
            {points?.map((reason, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="group flex gap-4 items-start p-3 rounded-xl hover:bg-white/60 hover:shadow-md transition-all duration-300"
              >
                <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-700 to-teal-600 text-white font-bold shadow-md group-hover:shadow-blue-400/40 transition-all duration-500">
                  ✓
                </div>

                <span className="text-gray-700 text-base leading-relaxed font-medium">
                  {reason}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* RIGHT — IMAGE */}
        <div
          className="relative w-full lg:w-[40%] flex justify-center lg:justify-end"
          style={{ transform: `translateY(${rightSectionOffset}px)` }}
        >
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative flex justify-center"
          >
            {/* Glow Behind */}
            <motion.div
              className="absolute w-[280px] h-[280px] rounded-full bg-gradient-to-tr from-blue-400 via-indigo-500 to-purple-400 blur-xl"
              style={{
                transform: `translate(${glowOffset.x}px, ${glowOffset.y}px)`,
                opacity: glowOpacity,
              }}
            />

            {/* Ring */}
            <div
              className="absolute w-[580px] h-[280px] rounded-full border-8 border-white/70 bg-white/1000 backdrop-blur-md shadow-inner shadow-blue-200/50 flex items-center justify-center"
              style={{
                transform: `translate(${ringOffset.x}px, ${ringOffset.y}px)`,
              }}
            >
              <motion.img
                src={image || '/on-job-support/Frame 278.png'}
                alt="Why Choose SkillVedika"
                className="w-[240px] h-[240px] object-cover rounded-full border-4 border-white shadow-xl"
                style={{ x }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        /* Animation moved to external CSS file for better performance */
      `}</style>
    </section>
  );
}
