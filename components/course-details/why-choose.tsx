'use client';

import type { ComponentType } from 'react';
import { Briefcase, Target, ClipboardList, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Lazy load EnrollModal
const EnrollModal = dynamic(
  () => import('@/components/EmptyLoginForm').then(mod => ({ default: mod.EnrollModal })),
  { ssr: false }
);

const icons = [Briefcase, Target, ClipboardList, CheckCircle];
const accents = [
  'from-blue-200 to-blue-400',
  'from-purple-200 to-purple-400',
  'from-green-200 to-green-400',
  'from-indigo-200 to-indigo-400',
];

interface WhyChooseProps {
  list?: Array<{ title?: string; description?: string }> | null;
}

export default function WhyChoose({ list }: Readonly<WhyChooseProps>) {
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [courses, setCourses] = useState<{ id: number; title: string }[]>([]);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) return;

        const res = await fetch(`${apiUrl}/courses`);
        if (!res.ok) return;

        const data = await res.json();
        let coursesArray: any[] = [];
        if (Array.isArray(data)) {
          coursesArray = data;
        } else if (data?.data && Array.isArray(data.data)) {
          coursesArray = data.data;
        } else if (data?.courses && Array.isArray(data.courses)) {
          coursesArray = data.courses;
        }

        const courseList = coursesArray.map((course: any) => ({
          id: course.id || course.course_id || 0,
          title: course.title || course.course_name || '',
        }));

        setCourses(courseList);
      } catch (err) {
        console.error('Error fetching courses:', err);
      }
    }

    fetchCourses();
  }, []);

  // -----------------------------------------
  // 🛡 Ensure dynamic content is safe
  // -----------------------------------------
  const items =
    Array.isArray(list) && list.length > 0
      ? list.map((item: any, index: number) => {
          const Icon = icons[index % icons.length] as ComponentType<{ className?: string }>;

          return {
            icon: <Icon className="w-6 h-6" />,
            title: typeof item.title === 'string' ? item.title : 'Untitled',
            description: typeof item.description === 'string' ? item.description : '',
            accent: accents[index % accents.length],
            badge: index === 0 ? "Lead" : String(index + 1),
          };
        })
      : []; // If backend sends empty array → hide section

  if (items.length === 0) return null;

  return (
    <section className="relative bg-gradient-to-b from-white to-slate-50 px-6 py-20 overflow-hidden">
      {/* Soft Background Shape */}
      <svg
        className="absolute -top-10 -left-10 opacity-20 w-72 h-72 text-blue-100"
        viewBox="0 0 200 200"
      >
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0" stopColor="#e6f0ff" />
            <stop offset="1" stopColor="#f0f7ff" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="60" fill="url(#g1)" />
      </svg>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            Why Choose Our Program?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We combine expert trainers, project-based learning, and tailored curriculum to ensure
            your team gains practical, job-ready skills.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-8 md:grid-cols-2">
          {items.map((item, idx) => (
            <motion.article
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="group flex gap-6 items-start p-6 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-transform duration-300 min-h-[150px]"
            >
              {/* Icon Box */}
              <div
                className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${item.accent} text-white shadow`}
              >
                <div className="w-7 h-7 text-white">{item.icon}</div>
              </div>

              {/* Text */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-between gap-3">
                  <span>{item.title}</span>
                  <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-100">
                    {item.badge}
                  </span>
                </h3>

                <p className="mt-2 text-gray-600 text-sm leading-relaxed">{item.description}</p>

                <div className="mt-4">
                  <button
                    onClick={() => setShowEnrollModal(true)}
                    className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 cursor-pointer"
                  >
                    Learn more →
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <motion.button
            onClick={() => setShowEnrollModal(true)}
            initial={{ scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-3 border border-gray-100 shadow-sm hover:shadow-md cursor-pointer"
          >
            {/* small filled blue circle before CTA label */}
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" aria-hidden="true" />

            <span className="px-3 py-1 rounded bg-white/70 text-sm font-semibold text-primary-700">
              Get a Demo
            </span>
            <span className="text-sm text-gray-700">Speak with our training advisors</span>
          </motion.button>
        </div>
      </div>

      {showEnrollModal && (
        <EnrollModal
          courses={courses}
          page="Course Details"
          onClose={() => setShowEnrollModal(false)}
        />
      )}
    </section>
  );
}
