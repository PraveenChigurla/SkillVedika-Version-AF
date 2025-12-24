'use client';

import type { ComponentType } from 'react';
import { Briefcase, CheckCircle, Award, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const icons = [Briefcase, CheckCircle, Award, BarChart3];
const accents = [
  'from-blue-400 to-blue-600',
  'from-pink-400 to-pink-600',
  'from-yellow-400 to-yellow-600',
  'from-teal-400 to-teal-600',
];

export default function KeyOutcomes({ list }: { list?: (string | { title?: string })[] | null }) {
  // ---------------------------------------------
  // 🔥 SAFETY: Normalize backend data
  // Backend may send:
  // ["X", "Y"] OR [{title: "X"}, {title: "Y"}]
  // ---------------------------------------------
  const safeArray = Array.isArray(list) ? list : [];

  const outcomes = safeArray.map((item, index) => {
    // If backend returns object {title: "..."}
    const title =
      typeof item === 'string' ? item : typeof item?.title === 'string' ? item.title : 'Untitled';

    const Icon = icons[index % icons.length] as ComponentType<{ className?: string }>;

    return {
      icon: <Icon className="w-6 h-6 text-white" />,
      title,
      description: `Learn ${title} with hands-on real world practice.`,
      accent: accents[index % accents.length],
    };
  });

  if (!outcomes.length) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#F7FAFF] via-[#EEF3FB] to-white px-6 py-24">
      {/* Background Orbs */}
      <div className="absolute top-10 right-16 w-80 h-80 bg-blue-200/40 blur-3xl rounded-full"></div>
      <div className="absolute bottom-10 left-20 w-72 h-72 bg-purple-200/40 blur-3xl rounded-full"></div>

      <div className="relative z-10 max-w-7xl mx-auto text-center">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              Key Learning Outcomes
            </span>
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            These outcomes ensure you gain the confidence, skills, and real-world expertise required
            to excel in modern tech roles.
          </p>
        </motion.div>

        {/* GRID */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        >
          {outcomes.map((item, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.04, rotate: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="group p-7 rounded-2xl bg-white/90 backdrop-blur-sm shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all min-h-[250px] flex flex-col items-center text-center"
            >
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.accent} shadow-md flex items-center justify-center mb-5 relative`}
              >
                {/* Floating Bubble */}
                <motion.div
                  className="absolute w-3 h-3 bg-white/50 rounded-full blur-[2px]"
                  animate={{ y: [-6, 6, -6] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ left: '70%', top: '10%' }}
                />
                {item.icon}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                {item.title}
              </h3>

              <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
