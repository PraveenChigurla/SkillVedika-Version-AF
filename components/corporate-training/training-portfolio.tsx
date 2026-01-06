'use client';

import { Monitor, Users, MessageCircle, Settings, Brain, Target } from 'lucide-react';

export default function TrainingPortfolio({
  title,
  subtitle,
  items,
}: {
  title: { text?: string };
  subtitle: string;
  items: { title: string; description: string }[];
}) {
  // Static icon + gradient mapping (6 items)
  const icons = [Monitor, Users, MessageCircle, Settings, Brain, Target];
  const gradients = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-orange-500 to-red-500',
    'from-green-500 to-emerald-500',
    'from-indigo-500 to-purple-500',
    'from-pink-500 to-rose-500',
  ];

  return (
    <section className="py-10 sm:py-14 lg:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Simplified background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10 -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-primary via-primary to-teal-500 bg-clip-text text-transparent">
              {title?.text || 'Training Portfolio'}
            </span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
            {subtitle}
          </p>
        </div>

        {/* Grid - Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {items?.map((item, idx) => {
            const Icon = icons[idx] || Monitor;
            const gradient = gradients[idx] || 'from-blue-500 to-cyan-500';

            return (
              <div
                key={idx}
                className="group relative bg-card/50 p-6 sm:p-8 rounded-2xl border border-border/50 hover:border-primary/50 transition-all duration-200 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 flex flex-col h-full"
                style={{ willChange: 'transform' }}
              >
                {/* Simplified gradient glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:to-accent/5 transition-opacity duration-300 -z-10" />

                {/* Icon container with gradient - Centered on mobile, left on desktop */}
                <div className="flex items-center justify-center sm:justify-start mb-4 sm:mb-6">
                  <div
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${gradient} p-0.5 group-hover:scale-105 transition-transform duration-200`}
                    style={{ willChange: 'transform' }}
                  >
                    <div className="w-full h-full rounded-2xl bg-background flex items-center justify-center">
                      <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-primary group-hover:scale-105 transition-transform duration-200" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed flex-1">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
