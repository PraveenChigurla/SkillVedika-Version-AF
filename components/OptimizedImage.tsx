'use client';

import Image from 'next/image';
import { ComponentProps } from 'react';

/**
 * Optimized Image component that automatically handles Cloudinary images
 * Cloudinary images are already optimized, so we bypass Next.js optimization
 * to prevent timeout issues while still maintaining Image component benefits
 */
export default function OptimizedImage({
  src,
  ...props
}: ComponentProps<typeof Image>) {
  // Check if the image is from Cloudinary
  const isCloudinary = typeof src === 'string' && src.includes('res.cloudinary.com');
  
  // For Cloudinary images, use unoptimized to prevent timeout
  // Cloudinary already serves optimized WebP images
  if (isCloudinary) {
    return (
      <Image
        {...props}
        src={src}
        unoptimized={true}
      />
    );
  }
  
  // For other images, use default Next.js optimization
  return <Image {...props} src={src} />;
}

