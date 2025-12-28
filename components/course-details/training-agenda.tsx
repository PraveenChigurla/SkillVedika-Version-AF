'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AgendaItem {
  week?: number | string;
  title?: string;
  content?: string;
}

export default function TrainingAgenda({ agenda = [] }: { agenda?: AgendaItem[] }) {
  if (!Array.isArray(agenda) || agenda.length === 0) return null;

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  // Map backend agenda to UI format
  const agendaList = agenda.map((item, index) => {
    // const Icon = icons[index % icons.length] as ComponentType<{ className?: string }>;
    return {
      week: item.week || index + 1,
      title: item.title || `Module ${index + 1}`,
      content: item.content || '',
      // icon: <Icon className="w-5 h-5" />,
    };
  });

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F7FAFF] via-[#EEF4FB] to-white py-24 px-4 sm:px-6 lg:px-8">
      {/* Background decorative glows */}
      <div className="absolute top-20 left-10 w-64 h-64 md:w-96 md:h-96 bg-blue-100/40 blur-3xl rounded-full"></div>
      <div className="absolute bottom-10 right-10 w-56 h-56 md:w-80 md:h-80 bg-teal-100/40 blur-3xl rounded-full"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            {agendaList.length}-Weeks Training Agenda
          </h2>

          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Each week builds your expertise step-by-step — click on a module to explore the topics
            in depth.
          </p>
        </div>

        {/* Timeline Accent Line */}
        <div className="absolute left-4 top-0 bottom-0 hidden md:block border-l border-blue-200"></div>

        {/* Accordion */}
        <div className="space-y-5 relative">
          {agendaList.map((item, idx) => (
            <motion.div
              key={idx}
              className={`relative bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-sm transition-all duration-300 
              ${openIdx === idx ? 'shadow-lg ring-1 ring-blue-200' : ''}`}
              whileHover={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 180, damping: 18 }}
            >
              {/* HEADER BUTTON */}
              <button
                id={`agenda-header-${idx}`}
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
                aria-expanded={openIdx === idx}
                aria-controls={`agenda-content-${idx}`}
                aria-label={`${openIdx === idx ? 'Collapse' : 'Expand'} ${item.title || `Week ${item.week}`}`}
              >
                <div className="flex items-center gap-4">
                  {/* Number Circle */}
                  <motion.div
                    className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold text-white transition-all duration-300 
                    ${openIdx === idx ? 'bg-gradient-to-r from-blue-500 to-teal-400 scale-110' : 'bg-blue-800'}`}
                    whileHover={{ scale: 1.15 }}
                  >
                    {item.week}
                  </motion.div>

                  {/* Title */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-lg font-semibold transition-colors duration-300 
                      ${openIdx === idx ? 'text-blue-700' : 'text-gray-900'}`}
                    >
                      {item.title}
                    </span>

                    {/* Icon */}
                    {/* <div
                      className={`text-gray-400 transition-colors ${
                        openIdx === idx ? 'text-blue-500' : ''
                      }`}
                    >
                      {item.icon}
                    </div> */}
                  </div>
                </div>

                {/* ARROW */}
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transform transition-transform duration-300 
                  ${openIdx === idx ? 'rotate-180 text-blue-500' : ''}`}
                  aria-hidden="true"
                />
              </button>

              {/* CONTENT */}
              <AnimatePresence initial={false}>
                {openIdx === idx && (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35 }}
                    className="px-6 pb-6 text-gray-600 text-sm md:text-base leading-relaxed border-t border-blue-50"
                  >
                    {item.content}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Floating Orbs */}
        <motion.div
          className="absolute -top-10 right-[10%] w-10 h-10 bg-blue-300/30 rounded-full blur-xl"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 left-[15%] w-14 h-14 bg-teal-300/30 rounded-full blur-xl"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, delay: 1 }}
        />
      </div>
    </section>
  );
}
