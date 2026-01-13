'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import SafeHTML from '@/components/SafeHTML';

interface CTASectionProps {
  title?: string;
  description?: string;
  buttonText?: string;
}

export default function CTASection({ 
  title = "Ready to Start Your Teaching Journey?",
  description = "Join thousands of instructors who are making a difference. Start your application today and begin sharing your expertise with learners around the world.",
  buttonText = "Apply Now — It Takes Less Than 2 Minutes"
}: CTASectionProps) {
  const scrollToForm = () => {
    const element = document.getElementById('instructor-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
          <SafeHTML html={title} className="prose prose-invert prose-lg max-w-none" />
        </h2>

        {/* Supporting Text */}
        <div className="text-base sm:text-lg md:text-xl text-blue-50 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
          <SafeHTML html={description} className="prose prose-invert prose-lg max-w-none" />
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Button
            onClick={scrollToForm}
            size="lg"
            className="group bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold px-8 sm:px-10 py-6 sm:py-7 text-base sm:text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 min-w-[280px] sm:min-w-[320px]"
          >
            {buttonText}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </section>
  );
}

