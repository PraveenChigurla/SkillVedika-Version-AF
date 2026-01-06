'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function OurProcess({
  title,
  subtitle,
  steps,
}: {
  title: { text?: string } | null;
  subtitle: string;
  steps: {
    number: number;
    title: string;
    description: string;
  }[];
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 300);
  }, []);

  return (
    <section className="relative bg-gradient-to-b from-[#F8FAFF] via-[#F3F5FF] to-blue-50 pt-8 sm:pt-10 lg:pt-12 pb-12 sm:pb-14 lg:pb-16 overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-10 left-20 w-72 h-72 bg-blue-300/20 blur-3xl rounded-full animate-pulse-slow" />
      <div className="absolute bottom-10 right-20 w-80 h-80 bg-purple-300/20 blur-[110px] rounded-full animate-pulse-slow" />

      <div className="max-w-5xl mx-auto relative z-10 px-4 sm:px-6">
        {/* HEADER */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            {title?.text || 'Our Process'}
          </h2>

          <p
            className="text-sm sm:text-base md:text-lg text-gray-600 mt-2 max-w-2xl mx-auto px-2"
            dangerouslySetInnerHTML={{ __html: subtitle || '' }}
          />
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="hidden sm:block absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-200 via-purple-200 to-blue-200 opacity-60 -translate-x-1/2"></div>

          {/* STEPS LOOP */}
          <div className="flex flex-col space-y-6 sm:space-y-8 lg:space-y-10 relative">
            {steps?.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                animate={{
                  opacity: isVisible ? 1 : 0,
                  y: isVisible ? 0 : 50,
                }}
                transition={{ duration: 0.6, delay: i * 0.2, ease: 'easeOut' }}
                className={`flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-10 ${
                  i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'
                }`}
              >
                {/* NUMBER BADGE - First on Mobile, Positioned by flex-row/flex-row-reverse on Desktop */}
                <div className="relative flex justify-center items-center order-1 sm:order-none flex-shrink-0">
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-12 h-12 sm:w-14 md:w-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center text-white text-lg sm:text-xl md:text-2xl font-bold shadow-lg border-3 sm:border-4 border-white"
                  >
                    {step.number}

                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-300 to-purple-300 blur-lg opacity-20"></div>
                  </motion.div>
                </div>

                {/* TEXT BLOCK - Second on Mobile */}
                <div
                  className={`w-full sm:w-1/2 order-2 sm:order-none ${
                    i % 2 === 0 ? 'text-left sm:text-right sm:pr-6 lg:pr-10' : 'text-left sm:pl-6 lg:pl-10'
                  }`}
                >
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 150, damping: 12 }}
                    className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm hover:shadow-lg transition-all duration-500"
                  >
                    <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">{step.title}</h3>

                    <p
                      className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: step.description || '' }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
