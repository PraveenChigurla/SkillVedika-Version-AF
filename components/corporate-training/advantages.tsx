'use client';

import {
  UserRound,
  FileText,
  Rocket,
  Scissors,
  BookOpen,
  BarChart2,
  BadgeDollarSign,
  Headphones,
} from 'lucide-react';

export default function Advantages({
  title,
  subtitle,
  leftItems,
  rightItems,
}: {
  title: { part1?: string; highlight?: string; part3?: string };
  subtitle: string;
  leftItems: { title: string; description: string }[];
  rightItems: { title: string; description: string }[];
}) {
  // Static icon mapping – based on index
  const leftIcons = [UserRound, Rocket, Headphones, BarChart2, BadgeDollarSign];
  const rightIcons = [Scissors, BookOpen, FileText];

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            {title?.part1}{' '}
            <span className="bg-gradient-to-r from-primary to-teal-500 bg-clip-text text-transparent">
              {title?.highlight}
            </span>{' '}
            {title?.part3}
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-36 gap-y-12 max-w-5xl mx-auto">
          {/* LEFT COLUMN */}
          {leftItems?.map((item, idx) => {
            const Icon = leftIcons[idx] || UserRound;

            return (
              <div key={idx} className="group flex gap-5">
                <div className="shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-teal-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                </div>

                <div className="pt-1">
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}

          {/* RIGHT COLUMN */}
          {rightItems?.map((item, idx) => {
            const Icon = rightIcons[idx] || FileText;

            return (
              <div key={idx} className="group flex gap-5">
                <div className="shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-teal-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                </div>

                <div className="pt-1">
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
