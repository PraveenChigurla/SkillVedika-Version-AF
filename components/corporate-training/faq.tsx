'use client';

import { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHrFaqs() {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        const apiUrl = apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`;
        const res = await fetch(`${apiUrl}/hr-faqs`);
        const data = await res.json();
        setFaqs(data);
      } catch (error) {
        console.error('HR FAQ fetch error:', error);
      } finally {
        setLoading(false);
      }
    }

    loadHrFaqs();
  }, []);

  if (loading) {
    return <p className="text-center py-10 text-gray-500">Loading HR FAQs...</p>;
  }

  if (!faqs.length) {
    return <p className="text-center py-10 text-gray-500">No HR FAQs available.</p>;
  }

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-[#003366]">
            FAQs for HR Professionals
          </h2>
        </div>

        <div className="space-y-5">
          {faqs.map((faq, idx) => (
            <div
              key={faq.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4">
                  <span className="text-[#003366] font-bold text-sm w-8">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  <span className="font-medium text-gray-900">{faq.question}</span>
                </div>

                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#1E4B91] text-white">
                  {openIdx === idx ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
              </button>

              {openIdx === idx && (
                <div className="px-14 py-4 bg-gray-50 border-t border-gray-200 text-gray-700 text-sm leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
