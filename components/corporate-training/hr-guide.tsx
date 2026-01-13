'use client';

import { ClipboardList, BarChart3, Headphones, ClipboardCheck } from 'lucide-react';

export default function HrGuide({
  title,
  subtitle,
  steps,
}: {
  title: { part1?: string; part2?: string };
  subtitle: string;
  steps: {
    step: string;
    title: string;
    description: string;
  }[];
}) {
  // Static icon mapping based on index
  const icons = [ClipboardList, ClipboardCheck, BarChart3, Headphones];

  return (
    <section className="py-10 sm:py-14 lg:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 px-2">
            <span className="bg-gradient-to-r from-primary to-teal-500 bg-clip-text text-transparent">
              {title?.part1}
            </span>{' '}
            {title?.part2}
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2">
            {subtitle}
          </p>
        </div>

        {/* DESKTOP TIMELINE - Horizontal */}
        <div className="hidden lg:block relative overflow-visible">
          {/* Connection Line */}
          <div className="absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/50 to-accent/20" />

          <div className="grid grid-cols-4 gap-4 lg:gap-8">
            {steps?.map((guide, idx) => {
              const Icon = icons[idx] || ClipboardList;

              return (
                <div key={idx} className="relative overflow-visible flex flex-col h-full">
                  {/* Step Number Circle */}
                  <div className="flex justify-center mb-6">
                    <div className="relative group">
                      {/* Glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />

                      {/* Main Circle */}
                      <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-primary to-teal-600 p-0.5 group-hover:scale-110 transition-transform duration-300">
                        <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                          <Icon className="w-8 h-8 lg:w-10 lg:h-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                        </div>
                      </div>

                      {/* Step Number Badge */}
                      <div className="absolute -top-2 -right-2 w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center text-primary-foreground text-xs lg:text-sm font-bold shadow-lg">
                        {guide.step}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="bg-card/50 rounded-2xl p-4 lg:p-6 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 group flex flex-col h-full">
                    <h3 className="text-lg lg:text-xl font-bold mb-2 lg:mb-3 text-foreground group-hover:text-primary transition-colors">
                      {guide.title}
                    </h3>
                    <div
                      className="text-xs sm:text-sm text-muted-foreground leading-relaxed flex-1 [&_p]:my-2 [&_h1]:text-base lg:[&_h1]:text-lg [&_h1]:font-bold [&_h1]:my-2 [&_h2]:text-sm lg:[&_h2]:text-base [&_h2]:font-bold [&_h2]:my-2 [&_h3]:text-xs lg:[&_h3]:text-sm [&_h3]:font-bold [&_h3]:my-1 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_blockquote]:border-l-2 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:italic"
                      dangerouslySetInnerHTML={{ __html: guide.description }}
                    />
                  </div>

                  {/* Arrow (not last item) */}
                  {idx < steps.length - 1 && (
                    <div className="absolute top-24 -right-2 lg:-right-4 w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center">
                      <div className="w-2 h-2 lg:w-3 lg:h-3 border-t-2 border-r-2 border-primary rotate-45" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* MOBILE/TABLET TIMELINE - Vertical */}
        <div className="lg:hidden space-y-6 sm:space-y-8">
          {steps?.map((guide, idx) => {
            const Icon = icons[idx] || ClipboardList;

            return (
              <div key={idx} className="relative flex gap-4 sm:gap-6">
                {/* Left side - Step Number Above Content on Mobile */}
                <div className="flex flex-col items-center">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />

                    {/* Main circle */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary to-accent p-0.5 group-hover:scale-110 transition-transform duration-300">
                      <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                        <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                      </div>
                    </div>

                    {/* Step Number */}
                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                      {guide.step}
                    </div>
                  </div>

                  {/* Vertical Connector */}
                  {idx < steps.length - 1 && (
                    <div className="w-0.5 flex-1 min-h-[60px] sm:min-h-[80px] bg-gradient-to-b from-primary/50 to-accent/20 mt-4" />
                  )}
                </div>

                {/* Right Content */}
                <div className="flex-1 pb-6 sm:pb-8">
                  <div className="bg-card/50 rounded-2xl p-4 sm:p-6 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 group h-full flex flex-col">
                    <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-foreground group-hover:text-primary transition-colors">
                      {guide.title}
                    </h3>
                    <div
                      className="text-sm text-muted-foreground leading-relaxed flex-1 [&_p]:my-2 [&_h1]:text-base sm:[&_h1]:text-lg [&_h1]:font-bold [&_h1]:my-2 [&_h2]:text-sm sm:[&_h2]:text-base [&_h2]:font-bold [&_h2]:my-2 [&_h3]:text-xs sm:[&_h3]:text-sm [&_h3]:font-bold [&_h3]:my-1 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_blockquote]:border-l-2 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:italic"
                      dangerouslySetInnerHTML={{ __html: guide.description }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
