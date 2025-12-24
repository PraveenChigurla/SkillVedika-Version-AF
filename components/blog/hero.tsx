import Image from 'next/image';

export default function Hero({
  title,
  description,
  image,
}: {
  title: { text?: string; part1?: string; part2?: string } | null;
  description: string;
  image: string;
}) {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* LEFT CONTENT */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {(() => {
                const hasParts = Boolean(
                  (title?.part1 && title.part1.trim()) || (title?.part2 && title.part2.trim())
                );
                const p1 = hasParts
                  ? (title?.part1 ?? title?.text ?? '')
                  : (title?.text ?? 'Explore');
                const p2 = hasParts ? (title?.part2 ?? '') : '';

                return (
                  <>
                    <span className="text-[#1E5BA8]">{p1}</span>{' '}
                    {p2 ? <span className="text-gray-900">{p2}</span> : null}
                  </>
                );
              })()}
            </h1>

            {/* Description (HTML from TipTap) */}
            <p
              className="text-gray-700 text-lg mb-8 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: description || '' }}
            />
          </div>

          {/* RIGHT IMAGE */}
          <div className="flex justify-center md:justify-end">
            <div className="relative w-80 h-80 rounded-full bg-blue-100 flex items-center justify-center">
              <Image
                src={image || '/blog/Frame 290.png'}
                alt="Blog illustration"
                width={420}
                height={420}
                className="w-80 h-80 object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
