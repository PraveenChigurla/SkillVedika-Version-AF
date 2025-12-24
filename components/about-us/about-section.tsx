import SafeHTML from '@/components/SafeHTML';
import Image from 'next/image';

export default function AboutSection({
  image,
  title,
  description,
}: Readonly<{
  image: string;
  title: { text?: string; part1?: string; part2?: string } | null;
  description: string;
}>) {
  return (
    <section
      className="relative bg-gradient-to-br from-[#e8efff] via-[#e8fbff] to-[#e8efff] px-6 py-20 md:py-28"
      aria-labelledby="about-section-title"
    >
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* LEFT IMAGE */}
        <div className="flex justify-center md:justify-left">
          <div className="w-full max-w-[400px] aspect-square relative">
            <Image
              src={image || '/about-us/Frame 281.png'}
              alt="About SkillVedika - Online courses and professional training platform"
              width={400}
              height={400}
              className="object-contain w-full h-full drop-shadow-xl"
              loading="lazy"
              quality={85}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 80vw, 400px"
            />
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="space-y-6">
          {/* Title with multi-part handling */}
          <h2
            id="about-section-title"
            className="text-4xl md:text-5xl font-extrabold text-[#002B5B] leading-tight"
          >
            {title?.text || title?.part1 || 'About Us'}{' '}
            {title?.part2 && <span className="text-[#002B5B]">{title.part2}</span>}
          </h2>

          {/* TipTap HTML */}
          <SafeHTML
            html={description || ''}
            className="text-[#1e293b] text-lg leading-relaxed space-y-4 whitespace-normal break-words break-all"
          />
        </div>
      </div>

      {/* Decorative Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#e0e7ff]/40 pointer-events-none" />
    </section>
  );
}
