'use client';

import { useEffect } from 'react';

interface LCPPreloadProps {
  imageUrl: string;
}

/**
 * Preloads the LCP (Largest Contentful Paint) image to reduce resource load delay
 * This component creates a preload link in the document head
 */
export default function LCPPreload({ imageUrl }: LCPPreloadProps) {
  useEffect(() => {
    if (!imageUrl || typeof window === 'undefined') return;

    // Properly encode the URL to handle special characters
    const encodedUrl = encodeURI(imageUrl);

    // Check if preload link already exists
    const existingLink = document.querySelector(
      `link[rel="preload"][as="image"][href="${encodedUrl}"]`
    );
    if (existingLink) return;

    // Create preload link
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = encodedUrl;
    // Note: fetchpriority is not supported in Firefox, but it's safe to include
    // as browsers will ignore unsupported attributes
    if (typeof window !== 'undefined' && !navigator.userAgent.includes('Firefox')) {
      link.setAttribute('fetchpriority', 'high');
    }

    // Add to head
    document.head.appendChild(link);

    // Cleanup on unmount
    return () => {
      const linkToRemove = document.querySelector(
        `link[rel="preload"][as="image"][href="${encodedUrl}"]`
      );
      if (linkToRemove) {
        linkToRemove.remove();
      }
    };
  }, [imageUrl]);

  return null;
}
