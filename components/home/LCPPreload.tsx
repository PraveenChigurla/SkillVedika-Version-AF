'use client';

import { useEffect } from 'react';

interface LCPPreloadProps {
  imageUrl: string;
}

export default function LCPPreload({ imageUrl }: LCPPreloadProps) {
  useEffect(() => {
    // Preload LCP image - only preload if it's a local image
    if (!imageUrl || typeof window === 'undefined') {
      return;
    }

    // Normalize the URL to ensure proper encoding
    let normalizedUrl = imageUrl;
    if (!normalizedUrl.startsWith('http')) {
      // Ensure proper URL encoding for local paths
      normalizedUrl = normalizedUrl.startsWith('/') ? normalizedUrl : `/${normalizedUrl}`;
    }

    // Properly encode the URL to handle spaces and special characters
    const encodedUrl = encodeURI(normalizedUrl);

    // Check if link already exists (check both encoded and unencoded)
    const existingLink = document.querySelector(
      `link[href="${normalizedUrl}"], link[href="${encodedUrl}"]`
    );
    if (existingLink) {
      return; // Already preloaded
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = encodedUrl; // Use encoded URL
    // Completely skip fetchpriority to avoid Firefox compatibility warnings
    // The preload itself is sufficient for performance
    // Note: fetchpriority is not supported in Firefox, so we omit it entirely
    document.head.appendChild(link);

    return () => {
      // Cleanup - check both encoded and unencoded
      const linkToRemove = document.querySelector(
        `link[href="${normalizedUrl}"], link[href="${encodedUrl}"]`
      );
      if (linkToRemove) {
        document.head.removeChild(linkToRemove);
      }
    };
  }, [imageUrl]);

  return null;
}
