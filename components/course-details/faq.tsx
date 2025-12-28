'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFaqs() {
      try {
        // Use getApiUrl helper for consistent URL construction
        const { getApiUrl } = await import('@/lib/apiConfig');
        const apiUrl = getApiUrl('/faqs');
        
        console.log('Fetching FAQs from:', apiUrl); // Debug log
        
        const res = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          // Add credentials for cookie-based auth if needed
          credentials: 'omit',
          // Add cache control
          cache: 'no-store', // Always fetch fresh data for FAQs
        });

        if (!res.ok) {
          console.warn('FAQ API error:', res.status);
          setFaqs([]);
          setLoading(false);
          return;
        }

        let payload = await res.json();

        // Handle different response formats:
        // 1. { faqs: [...] } - backend returns this format
        // 2. { success: true, data: [...] }
        // 3. Direct array [...]
        let faqArray: any[] = [];

        if (payload && typeof payload === 'object') {
          if (Array.isArray(payload)) {
            faqArray = payload;
          } else if (payload.faqs && Array.isArray(payload.faqs)) {
            faqArray = payload.faqs;
          } else if (payload.data && Array.isArray(payload.data)) {
            faqArray = payload.data;
          } else if (payload.success && payload.data && Array.isArray(payload.data)) {
            faqArray = payload.data;
          }
        }

        // Only include FAQs with a truthy/showing flag
        const visible = faqArray.filter((f: any) => {
          const raw = f?.show;
          if (raw === undefined || raw === null) return true; // default to show
          if (typeof raw === 'boolean') return raw === true;
          if (typeof raw === 'number') return raw === 1;
          const s = String(raw).trim().toLowerCase();
          return s === 'y' || s === 'yes' || s === '1' || s === 'true';
        });

        setFaqs(visible);
      } catch (error) {
        console.error('FAQ fetch error:', error);
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    }

    loadFaqs();
  }, []);

  if (loading) {
    return <p className="text-center py-10 text-gray-500">Loading FAQs...</p>;
  }

  if (!faqs.length) {
    return <p className="text-center py-10 text-gray-500">No FAQs available.</p>;
  }

  return (
    <section className="bg-white px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">Frequently Asked Questions</h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={faq.id}
              className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full p-6 flex justify-between items-center hover:bg-gray-100 transition"
              >
                <span className="font-medium text-gray-900 text-left">{faq.question}</span>

                <div
                  className={`w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-white transition ${
                    openIdx === idx ? 'rotate-45' : ''
                  }`}
                >
                  <Plus className="w-4 h-4" />
                </div>
              </button>

              {openIdx === idx && (
                <div className="px-6 pb-6 border-t border-gray-200 text-gray-600">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
