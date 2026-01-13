'use client';

import { useAOS } from '@/hooks/useAOS';
import { GraduationCap, Brain, MessageSquare, FileText, Star, UserRound } from 'lucide-react';
import parse from 'html-react-parser';

interface JobAssistanceProps {
  jobAssist?: any;
}

export default function JobAssistance({ jobAssist }: Readonly<JobAssistanceProps>) {
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
    <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-[#F4F8FC] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ⭐ Dynamic Header */}
        <div data-aos="fade-up" className="text-center mb-8 sm:mb-12">
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1E3A8A] mb-2 px-2">
            {jobAssist?.job_assistance_heading
              ? parse(jobAssist.job_assistance_heading)
              : 'Job Assistance Programme'}
          </div>

          <div className="text-gray-700 text-sm sm:text-base px-2">
            {jobAssist?.job_assistance_content ? parse(jobAssist.job_assistance_content) : null}
          </div>
        </div>

        {/* ⭐ Dynamic Feature Grid */}
        <div className="flex flex-col md:flex-row md:flex-wrap justify-center gap-4 sm:gap-6 md:gap-y-8 md:gap-x-8 lg:gap-x-16 items-stretch">
          {features.map((feature: any, index: number) => (
            <div
              key={index}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className={`flex items-start sm:items-center gap-4 sm:gap-5 bg-white rounded-xl sm:rounded-2xl border border-[#E1E8F0] shadow-sm hover:shadow-md transition-all p-4 sm:p-6 md:p-7 w-full
                ${[0, 3, 4].includes(index) ? 'md:w-[520px]' : 'md:w-[350px]'} 
               `}
            >
              <div className="flex items-center justify-center w-12 h-12 sm:w-[70px] sm:h-[70px] rounded-full bg-[#EBF2FF] flex-shrink-0 border border-[#C3D4F2]">
                <div className="scale-75 sm:scale-100">
                {feature.icon}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
