'use client';

import { useEffect, useState } from 'react';
import { useAOS } from '@/hooks/useAOS';

import { GraduationCap, Brain, MessageSquare, FileText, Star, UserRound } from 'lucide-react';

function getIconByIndex(index: number) {
  const icons = [
    <GraduationCap size={28} className="text-blue-700" />,
    <MessageSquare size={28} className="text-blue-700" />,
    <Brain size={28} className="text-blue-700" />,
    <FileText size={28} className="text-blue-700" />,
    <Star size={28} className="text-blue-700" />,
    <UserRound size={28} className="text-blue-700" />,
  ];

  // Cycle through icons if there are more points than icons
  return icons[index % icons.length];
}

export default function JobAssistance() {
  const [content, setContent] = useState<any>(null);
  useAOS();

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
    fetch(`${apiUrl}/job-assistance`)
      .then(res => {
        if (!res.ok) {
          console.warn('Job Assistance API error:', res.status);
          return null;
        }
        return res.json();
      })
      .then(response => {
        if (!response) {
          // Set default content if API fails
          setContent({
            title: { main: 'Job Assistance Program' },
            subtitle:
              'Our job assistance program helps you land your dream role with personalized guidance and support',
            points: [],
          });
          return;
        }
        // Handle both wrapped (success + data) and direct responses
        const data = response?.success && response?.data ? response.data : response;
        const jobData = Array.isArray(data) ? data[0] : data;

        // Normalize the data structure
        const normalizedData = {
          title:
            typeof jobData?.title === 'string'
              ? { main: jobData.title }
              : jobData?.title || { main: 'Job Assistance Program' },
          subtitle:
            jobData?.subtitle ||
            jobData?.description ||
            'Our job assistance program helps you land your dream role',
          points: Array.isArray(jobData?.points)
            ? jobData.points
            : Array.isArray(jobData?.features)
              ? jobData.features.map((f: string) => ({ title: f, desc: '' }))
              : [],
        };
        setContent(normalizedData);
      })
      .catch(err => {
        console.error('Job Assistance fetch error:', err);
        // Set default content on error
        setContent({
          title: { main: 'Job Assistance Program' },
          subtitle: 'Our job assistance program helps you land your dream role',
          points: [],
        });
      });
  }, []);

  // Don't return null - render with default content if needed
  const displayContent = content || {
    title: { main: 'Job Assistance Program' },
    subtitle: 'Our job assistance program helps you land your dream role',
    points: [],
  };

  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-br from-[#F7FAFF] via-[#EEF3FB] to-white overflow-hidden">
      {/* Floating shapes */}
      <div className="absolute top-10 left-0 w-64 h-64 bg-blue-100/40 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-10 w-72 h-72 bg-indigo-100/40 blur-3xl rounded-full"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div data-aos="fade-up" className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1E3A8A] mb-3 bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-indigo-600">
            {displayContent.title?.main || 'Job Assistance Program'}
          </h2>
          <p className="text-gray-700 text-base md:text-lg max-w-xl mx-auto">
            {displayContent.subtitle || ''}
          </p>
        </div>

        {/* Features */}
        <div className="flex flex-col md:flex-row md:flex-wrap justify-center gap-y-8 md:gap-y-10 md:gap-x-16 items-center">
          {Array.isArray(displayContent.points) && displayContent.points.length > 0 ? (
            displayContent.points.map((f: any, index: number) => (
              <div
                key={index}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className={`relative flex items-center gap-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-lg transition-all p-6 md:p-7
                ${[0, 3, 4].includes(index) ? 'md:w-[520px]' : 'md:w-[350px]'}
              `}
              >
                {/* ICON (Same UI as static version) */}
                <div className="relative flex items-center justify-center w-[70px] h-[70px] rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 shadow-inner border border-blue-200/60 flex-shrink-0">
                  {getIconByIndex(index)}
                </div>

                {/* Text */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>Job assistance features coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
