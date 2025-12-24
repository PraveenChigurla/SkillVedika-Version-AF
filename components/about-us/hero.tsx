import Image from 'next/image';

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-r from-[#e8efff] via-[#e8efff] to-[#e8efff] px-6 py-20 md:py-28"
      aria-labelledby="about-hero-title"
    >
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="space-y-6">
          <h1
            id="about-hero-title"
            className="text-4xl md:text-5xl font-extrabold text-[#002B5B] leading-tight"
          >
            Know More about Skill Vedika
          </h1>

          <p className="text-[#1e293b] text-lg leading-relaxed max-w-lg">
            Master in-demand tech skills with hands-on learning. Your gateway to upskilling,
            reskilling, and career growth in the digital world.
          </p>

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb">
            <div className="flex items-center gap-2 text-sm text-[#475569] font-medium">
              <a
                href="/"
                className="hover:text-[#002B5B] transition-colors"
                aria-label="Go to home page"
              >
                Home
              </a>
              <span className="text-[#94a3b8]" aria-hidden="true">
                ››
              </span>
              <span className="text-[#002B5B] font-semibold" aria-current="page">
                About
              </span>
            </div>
          </nav>

          {/* CTA Button */}
          <button
            className="mt-4 bg-[#002B5B] hover:bg-[#013a7b] text-white px-8 py-3 rounded-lg font-semibold shadow-md transition-all duration-200"
            aria-label="Contact SkillVedika today"
          >
            Contact us today
          </button>
        </div>

        {/* Right Image */}
        <div className="flex justify-center relative">
          <div className="w-full max-w-[380px] aspect-square relative">
            <Image
              src="/about-us/Frame 280.png"
              alt="SkillVedika - Online courses and professional training platform"
              width={380}
              height={380}
              className="object-contain w-full h-full drop-shadow-xl"
              loading="eager"
              priority
              quality={85}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 80vw, 380px"
            />
            <div
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,43,91,0.05)_0%,_transparent_70%)] rounded-full"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* Soft gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#e0e7ff]/40 pointer-events-none" />
    </section>
  );
}
