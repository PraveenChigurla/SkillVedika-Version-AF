'use client';

import Image from 'next/image';
import { BookOpen, Briefcase, Clock, Award } from 'lucide-react';

export default function KeyFeatures() {
  return (
    <section className="relative bg-gradient-to-b from-[#F5F9FF] to-[#E8F0F9] py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12 items-center">
          {/* Left Text Content */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold leading-snug text-[#1A3F66]">
              Key Features of <span className="text-[#2C5AA0]">SkillVedika</span>
            </h2>
            <p className="text-gray-700 text-sm md:text-base leading-relaxed">
              We believe in delivering top-tier technology training enriched with essential features
              to create an outstanding and immersive learning experience.
            </p>
          </div>

          {/* Center Graphic */}
          <div className="flex justify-center">
            <div className="relative">
              <Image
                src="/home/Frame 211.png"
                alt="Key Features"
                width={230}
                height={230}
                className="mx-auto z-10 relative"
              />
              <div className="absolute inset-0 bg-[#2C5AA0]/10 blur-3xl rounded-full"></div>
            </div>
          </div>

          {/* Right Feature List */}
          <div className="space-y-5">
            {[
              { icon: <BookOpen size={22} />, text: 'Industry standard curriculum' },
              { icon: <Briefcase size={22} />, text: 'Real world projects' },
              { icon: <Clock size={22} />, text: 'Flexible schedules' },
              { icon: <Award size={22} />, text: 'Official certification guidance' },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-4 bg-white/80 backdrop-blur-sm border border-[#D6E4F0] rounded-lg px-5 py-3 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#E6EEFA] text-[#2C5AA0]">
                  {feature.icon}
                </div>
                <p className="font-semibold text-[#1A3F66] text-sm md:text-base">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Background Decorative Circles */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#2C5AA0]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#4A90E2]/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
    </section>
  );
}
