'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ImageContentSectionProps {
  title: ReactNode;
  content: ReactNode;
  image: string;
  reverse?: boolean;
}

export default function ImageContentSection({
  title,
  content,
  image,
  reverse = false,
}: ImageContentSectionProps) {
  return (
    // <section className="py-16 sm:py-20 lg:py-24">
    <section className="pt-6 sm:pt-8 lg:pt-10 pb-10 sm:pb-12 lg:pb-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex flex-col items-center gap-12 lg:gap-16 ${
            reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'
          }`}
        >
          {/* TEXT */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-xl text-center lg:text-left"
          >
            <div className="mb-6">{title}</div>
            {content}
          </motion.div>

          {/* IMAGE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full flex justify-center"
          >
            <div
              className="
                w-[220px] h-[220px]
                sm:w-[260px] sm:h-[260px]
                md:w-[320px] md:h-[320px]
                lg:w-[380px] lg:h-[380px]
                rounded-full
                bg-white/90
                border-8 border-white/70
                shadow-inner shadow-blue-200/50
                flex items-center justify-center
              "
            >
              <img
                src={image}
                alt=""
                className="
                  w-[160px] h-[160px]
                  sm:w-[190px] sm:h-[190px]
                  md:w-[230px] md:h-[230px]
                  lg:w-[270px] lg:h-[270px]
                  rounded-full object-cover
                "
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
