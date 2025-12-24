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
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Simplified background gradient - removed expensive radial gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10 -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-primary to-teal-500 bg-clip-text text-transparent">
              {title?.text || 'Training Portfolio'}
            </span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">{subtitle}</p>
        </div>

        {/* Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items?.map((item, idx) => {
            const Icon = icons[idx] || Monitor;
            const gradient = gradients[idx] || 'from-blue-500 to-cyan-500';

            return (
              <div
                key={idx}
                className="group relative bg-card/50 p-8 rounded-2xl border border-border/50 hover:border-primary/50 transition-all duration-200 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
                style={{ willChange: 'transform' }}
              >
                {/* Simplified gradient glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:to-accent/5 transition-opacity duration-300 -z-10" />

                {/* Icon container with gradient */}
                <div className="flex items-center justify-center mb-6">
                  <div
                    className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} p-0.5 group-hover:scale-105 transition-transform duration-200`}
                    style={{ willChange: 'transform' }}
                  >
                    <div className="w-full h-full rounded-2xl bg-background flex items-center justify-center">
                      <Icon className="w-10 h-10 text-primary group-hover:scale-105 transition-transform duration-200" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>

                {/* Removed expensive blur effect for performance */}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
