'use client';

import { useEffect, useState, useRef } from 'react';
import { Wrench, Users, Bug } from 'lucide-react';

export default function HowWeHelp({
  title,
  subtitle,
  points,
  footer,
}: {
  title: { text?: string; part1?: string; part2?: string; title?: string } | string | null;
  subtitle: string;
  points: {
    title?: string;
    label?: string;
    description: string;
  }[];
  footer: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollX, setScrollX] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const speed = isHovered ? 0.6 : 1.1;

  // Static icons + gradient colors
  const iconMap = [Wrench, Users, Bug, Users, Bug];
  const colorMap = [
    'from-blue-400 to-indigo-400',
    'from-purple-400 to-blue-400',
    'from-teal-400 to-indigo-400',
    'from-indigo-400 to-purple-400',
    'from-teal-400 to-indigo-400',
  ];

  // Merge dynamic titles/descriptions with static icons/colors
  const services =
    points?.map((p, i) => ({
      icon: iconMap[i % iconMap.length],
      color: colorMap[i % colorMap.length],
      title: p.title || p.label || '', // Support both 'title' and 'label' fields
      description: p.description || '',
    })) || [];

  const cards = [...services, ...services]; // for smooth infinite scroll

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Animation logic
  useEffect(() => {
    let frame: number;

    const animate = () => {
      const container = containerRef.current;
      if (!container) return;

      const width = container.scrollWidth / 2;
      setScrollX(prev => (prev + speed) % width);
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [speed]);

  return (
    <section className="relative bg-gradient-to-b from-white to-[#F8FAFF] py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-10 left-20 w-60 h-60 bg-blue-300/20 blur-3xl rounded-full"></div>
      <div className="absolute bottom-10 right-20 w-72 h-72 bg-purple-300/20 blur-[110px] rounded-full"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* HEADER */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-500 to-teal-600 bg-clip-text text-transparent">
              {(() => {
                if (!title) return 'How We Help';
                if (typeof title === 'string') return title;
                // Handle {part1, part2} format
                if (title.part1 !== undefined || title.part2 !== undefined) {
                  const part1 = title.part1 || '';
                  const part2 = title.part2 || '';
                  return part2 ? `${part1} ${part2}` : part1;
                }
                // Handle {text, title} format
                return title.text || title.title || 'How We Help';
              })()}
            </span>
          </h2>

          <p
            className="text-gray-600 text-base max-w-xl mx-auto"
            dangerouslySetInnerHTML={{ __html: subtitle || '' }}
          />
        </div>

        {/* CAROUSEL */}
        <div className="relative overflow-hidden">
          <div
            ref={containerRef}
            className="flex gap-10"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              transform: `translateX(-${scrollX}px)`,
              transition: 'transform 0.03s linear',
              willChange: 'transform',
            }}
          >
            {cards.map((service, i) => {
              const Icon = service.icon;
              return (
                <div key={i} className="flex-shrink-0 w-[350px]">
                  <div className="bg-white/70 backdrop-blur-xl border border-gray-200/60 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1">
                    {/* ICON */}
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center text-white shadow-md mb-5`}
                    >
                      <Icon className="w-7 h-7" strokeWidth={1.8} />
                    </div>

                    {/* TITLE */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>

                    {/* DESCRIPTION */}
                    <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER / TAGLINE */}
        <div
          className={`text-center mt-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/60 border border-gray-200/60 rounded-full backdrop-blur-md shadow-sm">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span className="text-sm font-medium text-gray-700">
              {footer || 'Trusted by 4,000+ professionals globally'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
