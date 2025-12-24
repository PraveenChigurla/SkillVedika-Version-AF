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
    <section className="py-16 px-4 bg-gradient-to-b from-[#F8FAFC] to-[#FFFFFF]">
      <div className="max-w-7xl mx-auto flex md:grid-cols-2 gap-16 items-center">
        {/* Left Image Section */}
        <div className="flex justify-left">
          <div className="relative w-92 h-92 flex items-center justify-center">
            <Image
              src={imagePath || '/corporate training/Frame 274.png'}
              alt="Empower Workforce Illustration"
              width={380}
              height={380}
              className="rounded-full object-cover z-10"
              loading="lazy"
              quality={75}
              sizes="(max-width: 768px) 380px, 380px"
            />
          </div>
        </div>

        {/* Right Text Section */}
        <div className="relative items-left justify-left">
          <h2 className="text-4xl font-bold mb-4 leading-snug text-blue-800">
            {title?.part1} <span className="text-teal-600">{title?.part2}</span>
          </h2>

          {/* TipTap HTML description - preserves text-align styles from editor */}
          <div
            className="text-lg text-gray-600 leading-relaxed space-y-4 [&_p]:my-2 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:my-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:my-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:my-2 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      </div>
    </section>
  );
}
