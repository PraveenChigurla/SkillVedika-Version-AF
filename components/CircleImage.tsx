// components/ui/CircleImage.tsx
import Image from 'next/image';

export default function CircleImage({
  src,
  alt,
  size = 96, // default: 96px (~w-24)
}: {
  src: string;
  alt: string;
  size?: number;
}) {
  return (
    <div
      className="relative rounded-full bg-gradient-to-br from-primary/20 to-accent/20 p-3 shadow-strong flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <div className="w-[85%] h-[85%] rounded-full overflow-hidden bg-background flex items-center justify-center">
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          className="object-contain rounded-full transition-transform hover:scale-105 duration-500"
          quality={85}
          loading="lazy"
          sizes={`${size}px`}
        />
      </div>
    </div>
  );
}
