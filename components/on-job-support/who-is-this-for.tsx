'use client';

import { useEffect, useState } from 'react';

export default function WhoIsThisFor({
  targetLabel,
  title,
  subtitle,
  cards,
}: {
  targetLabel: string;
  title: { text?: string } | null;
  subtitle: string;
  cards: {
    target: string;
    title: string;
    content: string;
  }[];
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-white overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-16 right-10 w-80 h-80 bg-purple-300/20 blur-[120px] rounded-full"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* HEADER */}
        <div
          className={`max-w-3xl mb-24 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-block px-4 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-6 shadow-sm backdrop-blur-sm">
            {targetLabel || 'TARGET AUDIENCE'}
          </div>

          <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            {title?.text || 'Who Is This For?'}
          </h2>

          <p
            className="text-xl text-gray-600 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: subtitle || '' }}
          />
        </div>

        {/* GRID OF CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {cards?.map((item, i) => (
            <div
              key={i}
              className={`group relative transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${(i + 2) * 150}ms` }}
            >
              <div className="relative bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl p-10 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-500 h-full overflow-hidden">
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-200/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                <div className="relative z-10">
                  {/* Subtitle */}
                  <div className="inline-block mb-3">
                    <span className="text-sm font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {item.target}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-blue-800 transition-colors duration-300">
                    {item.title}
                  </h3>

                  {/* Divider */}
                  <div className="w-16 h-1 bg-blue-300/40 rounded-full group-hover:w-54 group-hover:bg-blue-900 transition-all duration-500 mb-6"></div>

                  {/* Description */}
                  <p className="text-gray-600 text-lg leading-relaxed">{item.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
