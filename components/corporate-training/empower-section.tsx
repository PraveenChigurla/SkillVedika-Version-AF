'use client';

import Image from 'next/image';

export default function EmpowerSection({
  title,
  description,
  imagePath,
}: {
  title: { part1: string; part2: string };
  description: string;
  imagePath: string;
}) {
  return (
    <section className="py-10 sm:py-14 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F8FAFC] to-[#FFFFFF] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-16 items-center">
          {/* Left Image Section - First on Mobile */}
          <div className="flex justify-center lg:justify-start w-full lg:w-1/2 order-1 lg:order-1">
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] md:max-w-[380px] aspect-square flex items-center justify-center">
              <Image
                src={imagePath || '/corporate training/Frame 274.png'}
                alt="Empower Workforce Illustration"
                width={380}
                height={380}
                className="rounded-full object-cover w-full h-full"
                loading="lazy"
                quality={75}
                sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, 380px"
              />
            </div>
          </div>

          {/* Right Text Section */}
          <div className="w-full lg:w-1/2 order-2 lg:order-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 leading-tight sm:leading-snug text-blue-800">
              {title?.part1} <span className="text-teal-600">{title?.part2}</span>
            </h2>

            {/* TipTap HTML description - preserves text-align styles from editor */}
            <div
              className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed space-y-4 [&_p]:my-2 [&_h1]:text-2xl sm:[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:my-4 [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:my-3 [&_h3]:text-lg sm:[&_h3]:text-xl [&_h3]:font-bold [&_h3]:my-2 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
