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
    <section className="py-10 sm:py-14 lg:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 px-2">
            {title?.part1}{' '}
            <span className="bg-gradient-to-r from-primary to-teal-500 bg-clip-text text-transparent">
              {title?.highlight}
            </span>{' '}
            {title?.part3}
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            {subtitle}
          </p>
        </div>

        {/* Grid layout - Mobile: 1 col, Tablet: 2 cols, Desktop: 2 cols with gap */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-12 lg:gap-x-36 gap-y-8 sm:gap-y-12 max-w-5xl mx-auto">
          {/* LEFT COLUMN */}
          {leftItems?.map((item, idx) => {
            const Icon = leftIcons[idx] || UserRound;

            return (
              <div key={idx} className="group flex gap-4 sm:gap-5">
                <div className="shrink-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary/20 to-teal-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                </div>

                <div className="pt-1 flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}

          {/* RIGHT COLUMN */}
          {rightItems?.map((item, idx) => {
            const Icon = rightIcons[idx] || FileText;

            return (
              <div key={idx} className="group flex gap-4 sm:gap-5">
                <div className="shrink-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary/20 to-teal-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                </div>

                <div className="pt-1 flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
