'use client';

import { useEffect } from 'react';
import { useAOS } from '@/hooks/useAOS';
import { GraduationCap, Brain, MessageSquare, FileText, Star, UserRound } from 'lucide-react';
import parse from 'html-react-parser';

export default function JobAssistance({ jobAssist }) {
  useAOS();

  // ICON MAPPING (same icons as your static version)
  const icons = [
    <GraduationCap size={28} className="text-[#1E3A8A]" />,
    <Brain size={28} className="text-[#1E3A8A]" />,
    <MessageSquare size={28} className="text-[#1E3A8A]" />,
    <FileText size={28} className="text-[#1E3A8A]" />,
    <Star size={28} className="text-[#1E3A8A]" />,
    <UserRound size={28} className="text-[#1E3A8A]" />,
  ];

  // BUILD FEATURES FROM DB
  const features =
    jobAssist?.job_assistance_points?.map((item: any, index: number) => ({
      icon: icons[index % icons.length],
      title: item.title,
      desc: item.desc || item.content || '', // Support both 'desc' and 'content' fields
    })) || [];

  return (
    <section className="py-20 md:py-28 bg-[#F4F8FC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ⭐ Dynamic Header */}
        <div data-aos="fade-up" className="text-center mb-12">
          <div className="text-3xl md:text-4xl font-bold text-[#1E3A8A] mb-2">
            {jobAssist?.job_assistance_heading
              ? parse(jobAssist.job_assistance_heading)
              : 'Job Assistance Programme'}
          </div>

          <div className="text-gray-700 text-sm md:text-base">
            {jobAssist?.job_assistance_content ? parse(jobAssist.job_assistance_content) : null}
          </div>
        </div>

        {/* ⭐ Dynamic Feature Grid */}
        <div className="flex flex-col md:flex-row md:flex-wrap justify-center gap-y-8 md:gap-y-10 md:gap-x-16 items-center">
          {features.map((feature, index) => (
            <div
              key={index}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className={`flex items-center gap-5 bg-white rounded-2xl border border-[#E1E8F0] shadow-sm hover:shadow-md transition-all p-6 md:p-7 
                ${[0, 3, 4].includes(index) ? 'md:w-[520px]' : 'md:w-[350px]'} 
               `}
            >
              <div className="flex items-center justify-center w-[70px] h-[70px] rounded-full bg-[#EBF2FF] flex-shrink-0 border border-[#C3D4F2]">
                {feature.icon}
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
