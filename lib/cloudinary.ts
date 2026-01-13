/**
 * Cloudinary image optimization utilities
 * Generates optimized URLs from public_id at runtime
 */

const CLOUD_NAME = 'dvq4f3k7q';

/**
 * Checks if a string is a Cloudinary public_id
 * Public IDs typically don't have http/https or leading slashes
 */
export function isPublicId(str: string | undefined | null): boolean {
  if (!str) return false;
  return !str.startsWith('http://') && !str.startsWith('https://') && !str.startsWith('/');
}

/**
 * Generates an optimized Cloudinary URL from a public_id
 * 
 * @param publicId - Cloudinary public_id (e.g., "vx6avj4innb5ryoppp2m")
 * @param width - Desired width in pixels (default: 800)
 * @param format - Image format: 'webp', 'avif', 'auto' (default: 'webp')
 * @param quality - Image quality: 'auto' or number 1-100 (default: 'auto')
 * @param dpr - Device pixel ratio: 1, 2, or 'auto' (default: 2)
 * @returns Optimized Cloudinary URL
 * 
 * @example
 * getOptimizedImage('vx6avj4innb5ryoppp2m', 600)
 * // Returns: https://res.cloudinary.com/dvq4f3k7q/image/upload/f_webp,q_auto,w_600,dpr_2/vx6avj4innb5ryoppp2m
 */
export function getOptimizedImage(
  publicId: string,
  width: number = 800,
  format: 'webp' | 'avif' | 'auto' = 'webp',
  quality: 'auto' | number = 'auto',
  dpr: 1 | 2 | 'auto' = 2
): string {
  if (!publicId) {
    return '';
  }

  // If it's already a full URL, return as-is (backward compatibility)
  if (publicId.startsWith('http://') || publicId.startsWith('https://')) {
    return publicId;
  }

  const formatParam = format === 'auto' ? 'f_auto' : `f_${format}`;
  const qualityParam = quality === 'auto' ? 'q_auto' : `q_${quality}`;
  const dprParam = dpr === 'auto' ? 'dpr_auto' : `dpr_${dpr}`;

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${formatParam},${qualityParam},w_${width},${dprParam}/${publicId}`;
}

/**
 * Generates a responsive srcSet for an image
 * 
 * @param publicId - Cloudinary public_id
 * @param widths - Array of widths to generate (default: [400, 800, 1200, 1600])
 * @returns srcSet string
 */
export function getResponsiveSrcSet(
  publicId: string,
  widths: number[] = [400, 800, 1200, 1600]
): string {
  return widths
    .map((width) => `${getOptimizedImage(publicId, width)} ${width}w`)
    .join(', ');
}

/**
 * Gets the best image URL for a given public_id or legacy URL
 * Handles both new public_id format and legacy full URLs
 * 
 * @param image - Either a public_id or a full URL
 * @param width - Desired width (default: 800)
 * @returns Optimized URL
 */
export function getImageUrl(image: string | undefined | null, width: number = 800): string {
  if (!image) {
    return '';
  }

  // If it's already a full URL, return as-is (backward compatibility)
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }

  // If it's a public_id, generate optimized URL
  if (isPublicId(image)) {
    return getOptimizedImage(image, width);
  }

  // Fallback: return as-is
  return image;
}

