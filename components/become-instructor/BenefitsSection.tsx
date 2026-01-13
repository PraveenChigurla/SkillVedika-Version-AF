'use client';

import * as LucideIcons from 'lucide-react';
import SafeHTML from '@/components/SafeHTML';

interface Benefit {
  title: string;
  description: string;
  icon?: string;
  highlighted?: boolean;
}

interface BenefitsSectionProps {
  title?: string;
  subtitle?: string;
  benefits?: Benefit[];
}

// Default benefits if none provided
const defaultBenefits: Benefit[] = [
  {
    title: 'Competitive Compensation',
    description: 'Earn competitive rates while sharing your expertise. We value your knowledge and ensure fair compensation for your teaching efforts.',
    icon: 'DollarSign',
    highlighted: true,
  },
  {
    title: 'Reach Thousands of Learners',
    description: 'Connect with a global audience of eager learners. Your courses will reach students from around the world, maximizing your impact.',
    icon: 'Users',
  },
  {
    title: 'Flexible Schedule',
    description: 'Teach on your own time. Set your availability and create courses that fit your lifestyle and professional commitments.',
    icon: 'Calendar',
  },
  {
    title: 'Professional Growth',
    description: 'Build your reputation as an expert instructor. Gain recognition in your field and expand your professional network.',
    icon: 'TrendingUp',
  },
  {
    title: 'Support & Resources',
    description: 'Access comprehensive teaching resources, marketing support, and a dedicated team to help you succeed as an instructor.',
    icon: 'Headphones',
  },
  {
    title: 'Creative Freedom',
    description: 'Design courses your way. You have full control over your content, teaching style, and course structure.',
    icon: 'Sparkles',
  },
];

// Get icon component by name
function getIconComponent(iconName?: string) {
  if (!iconName) return LucideIcons.Star;
  const IconComponent = (LucideIcons as any)[iconName];
  return IconComponent || LucideIcons.Star;
}

export default function BenefitsSection({ 
  title = "Why Become an Instructor?",
  subtitle = "Join our community of expert instructors and enjoy these amazing benefits",
  benefits = defaultBenefits
}: BenefitsSectionProps) {
  return (
    <section
      id="benefits-section"
      className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <SafeHTML html={title} className="prose prose-lg max-w-none" />
          </h2>
          {subtitle && (
            <div className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              <SafeHTML html={subtitle} className="prose prose-lg max-w-none" />
            </div>
          )}
        </div>

        {/* Grid of Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {benefits.map((benefit, index) => {
            const Icon = getIconComponent(benefit.icon);
            const isHighlighted = benefit.highlighted;

            return (
              <div
                key={index}
                className={`
                  group relative
                  bg-white
                  rounded-xl sm:rounded-2xl
                  p-6 sm:p-8
                  border
                  shadow-sm
                  hover:shadow-xl
                  transition-all duration-300
                  flex flex-col
                  h-full
                  ${
                    isHighlighted
                      ? 'border-yellow-400 border-2 shadow-md hover:shadow-2xl hover:-translate-y-1 bg-gradient-to-br from-yellow-50/50 to-white'
                      : 'border-gray-200 hover:border-blue-300 hover:-translate-y-1'
                  }
                `}
              >
                {/* Highlighted Badge */}
                {isHighlighted && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-400 text-yellow-900">
                      Popular
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`
                    w-14 h-14 sm:w-16 sm:h-16
                    rounded-xl sm:rounded-2xl
                    flex items-center justify-center
                    mb-4 sm:mb-6
                    transition-transform duration-300
                    group-hover:scale-110
                    ${
                      isHighlighted
                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-yellow-900'
                        : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                    }
                  `}
                >
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>

                {/* Content */}
                <h3
                  className={`
                    text-xl sm:text-2xl
                    font-bold
                    mb-3 sm:mb-4
                    transition-colors duration-300
                    ${
                      isHighlighted
                        ? 'text-yellow-900 group-hover:text-yellow-800'
                        : 'text-gray-900 group-hover:text-blue-600'
                    }
                  `}
                >
                  {benefit.title}
                </h3>

                <p className="text-sm sm:text-base text-gray-600 leading-relaxed flex-1">
                  {benefit.description}
                </p>

                {/* Decorative gradient overlay on hover */}
                {!isHighlighted && (
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-50/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

