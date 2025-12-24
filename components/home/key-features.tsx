'use client';

import Image from 'next/image';
import { BookOpen, Briefcase, Clock, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import parse from 'html-react-parser';

interface KeyFeaturesProps {
  keyFeatures?: any;
}

export default function KeyFeatures({ keyFeatures }: Readonly<KeyFeaturesProps>) {
  // Map dynamic text points -> icons (looping safely)
  const icons = [
    <BookOpen size={20} />,
    <Award size={20} />,
    <Clock size={20} />,
    <Briefcase size={20} />,
  ];

  const features = (keyFeatures?.key_features_points || []).map((text: string, index: number) => ({
    icon: icons[index % icons.length], // auto-loop icons
    text,
  }));

  const [rotation, setRotation] = useState(0);

  // Optimized rotation - use requestAnimationFrame with throttling to reduce main thread work
  // Only update every 3 frames (20fps) to further reduce TBT and improve Speed Index
  useEffect(() => {
    let frameCount = 0;
    let rafId: number;

    // Defer animation start to reduce initial TBT
    const startAnimation = () => {
      const animate = () => {
        frameCount++;
        // Update every 3 frames (20fps) to reduce main thread work even more
        if (frameCount % 3 === 0) {
          setRotation(prev => (prev + 3) % 360);
        }
        rafId = requestAnimationFrame(animate);
      };

      rafId = requestAnimationFrame(animate);
    };

    // Defer animation start by 200ms to improve initial page load
    const timeoutId = setTimeout(startAnimation, 200);

    return () => {
      clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Active feature synced with rotation angle
  const activeIndex = Math.floor(((rotation + 45) % 360) / 90) % features.length;

  return (
    <section className="relative bg-gradient-to-br from-[#F6FAFF] via-[#EEF4FA] to-[#E6EEFA] py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-3 gap-16 items-center">
          {/* LEFT CONTENT — now fully dynamic */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* ⭐ Dynamic Title */}
            <div className="text-3xl md:text-4xl font-extrabold leading-snug text-[#1A3F66]">
              {keyFeatures?.key_features_title ? parse(keyFeatures.key_features_title) : null}
            </div>

            {/* ⭐ Dynamic Paragraph */}
            <div className="text-gray-700 text-base md:text-lg leading-relaxed max-w-md">
              {keyFeatures?.key_features_content ? parse(keyFeatures.key_features_content) : null}
            </div>
          </motion.div>

          {/* CENTER ROTATING ICON */}
          <div className="relative flex justify-center items-center">
            <motion.div
              animate={{ rotate: rotation }}
              transition={{ duration: 0 }}
              className="relative w-64 h-64 flex items-center justify-center"
            >
              {/* Outer Border */}
              <div className="absolute inset-0 rounded-full border-[3px] border-[#2C5AA0]/30" />
              <Image
                src="/home/Frame 211.png"
                alt="Rotating Icon"
                width={220}
                height={220}
                className="z-10 image-auto-aspect"
                loading="lazy"
                quality={85}
                sizes="(max-width: 768px) 220px, 220px"
              />
            </motion.div>

            {/* Soft glow background */}
            <div className="absolute w-72 h-72 bg-[#2C5AA0]/10 blur-3xl rounded-full" />
          </div>

          {/* RIGHT SIDE — dynamic feature cards */}
          <div className="flex flex-col gap-5 w-full max-w-lg">
            {features.map((feature: any, index: number) => {
              const isActive = index === activeIndex;
              return (
                <motion.div
                  key={index}
                  animate={{
                    scale: isActive ? 1.03 : 1,
                    backgroundColor: isActive
                      ? 'rgba(44, 90, 160, 0.15)'
                      : 'rgba(255, 255, 255, 0.9)',
                    x: isActive ? 6 : 0,
                  }}
                  whileHover={{
                    scale: 1.04,
                    backgroundColor: 'rgba(44,90,160,0.1)',
                  }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className={`relative flex items-center gap-5 rounded-xl border border-[#D6E4F0] px-8 py-4 shadow-md hover:shadow-lg backdrop-blur-sm transition-all duration-300 ${
                    isActive ? 'ring-2 ring-[#2C5AA0]/40' : ''
                  }`}
                >
                  {/* Circular Icon */}
                  <div
                    className={`absolute -left-5 flex items-center justify-center w-12 h-12 rounded-full ${
                      isActive ? 'bg-[#2C5AA0] text-white shadow-lg' : 'bg-[#E6EEFA] text-[#2C5AA0]'
                    }`}
                  >
                    {feature.icon}
                  </div>

                  {/* Text */}
                  <p
                    className={`ml-10 font-semibold text-base transition-all duration-300 ${
                      isActive ? 'text-[#2C5AA0]' : 'text-[#1A3F66]'
                    }`}
                  >
                    {feature.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BACKGROUND VISUAL ELEMENTS */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#4A90E2]/10 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#2C5AA0]/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
    </section>
  );
}
