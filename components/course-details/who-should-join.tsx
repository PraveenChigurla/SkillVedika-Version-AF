'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import whoImg from '@/public/course-details/image 39.png';

// Lazy load EnrollModal
const EnrollModal = dynamic(
  () => import('@/components/EmptyLoginForm').then(mod => ({ default: mod.EnrollModal })),
  { ssr: false }
);

interface WhoShouldJoinProps {
  list?: (string | number | { title?: string })[] | null;
}

export default function WhoShouldJoin({ list }: Readonly<WhoShouldJoinProps>) {
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

  // ---------------------------------------------
  // 🌟 Dynamic + Fallback Items
  // ---------------------------------------------
  const defaultItems = [
    'Aspiring Data Engineers looking to master Snowflake and cloud data pipelines.',
    'Experienced Professionals seeking to upskill in modern data warehousing and analytics.',
    'Organizations aiming to empower their teams with cutting-edge data platform knowledge.',
  ];

  // Accept array of strings from backend (who_should_join)
  const items =
    Array.isArray(list) && list.length > 0
      ? list.map(item => (typeof item === 'string' ? item : String(item)))
      : defaultItems;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F8FAFF] via-[#EEF3FB] to-white py-24 px-4 sm:px-6 lg:px-8">
      {/* Decorative Background */}
      <div className="absolute top-10 left-16 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl animate-pulse-slow"></div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
        {/* LEFT SIDE */}
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Who Should{' '}
              <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                Join?
              </span>
            </h2>

            <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
              This program is tailored for professionals and teams eager to build advanced data
              skills and thrive in the cloud-first era.
            </p>
          </div>

          {/* DYNAMIC BULLET POINTS */}
          <div className="space-y-5">
            {items.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 bg-white/90 p-4 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 transition-all backdrop-blur-sm"
              >
                <motion.div
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center text-white font-bold flex-shrink-0"
                  animate={{ rotate: [0, 10, -10, 10, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.5,
                    ease: 'easeInOut',
                    delay: idx * 0.3,
                  }}
                >
                  ✓
                </motion.div>

                <p className="text-gray-700 text-base leading-relaxed">{item}</p>
              </motion.div>
            ))}
          </div>

          {/* Learn More Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="pt-4"
          >
            <button
              onClick={() => setShowEnrollModal(true)}
              className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              Learn More
            </button>
          </motion.div>
        </motion.div>

        {/* RIGHT IMAGE */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-tr from-blue-200 via-purple-200 to-pink-100 rounded-full blur-3xl opacity-40 animate-pulse-slow"></div>

            <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-xl border border-blue-100">
              <Image
                src={whoImg}
                alt="Professionals in training"
                className="object-contain rounded-[2rem] transition-transform duration-500 hover:scale-105"
                priority
              />
            </div>

            <motion.div
              className="absolute top-0 -right-6 w-10 h-10 bg-blue-300/40 rounded-full blur-md"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />

            <motion.div
              className="absolute bottom-0 -left-6 w-14 h-14 bg-purple-300/40 rounded-full blur-md"
              animate={{ y: [0, 10, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
            />
          </div>
        </motion.div>
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
