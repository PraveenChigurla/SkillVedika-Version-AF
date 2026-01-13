/**
 * Lazy-loaded Carousel Components
 * 
 * Performance: Lazy-loads embla-carousel-react library to reduce initial bundle size.
 * Use this wrapper instead of importing carousel components directly when carousel
 * is not above-the-fold content.
 * 
 * Usage:
 * import { LazyCarousel } from '@/components/ui/lazy-carousel';
 * 
 * <LazyCarousel opts={{ loop: true }}>
 *   <LazyCarouselContent>
 *     <LazyCarouselItem>Slide 1</LazyCarouselItem>
 *   </LazyCarouselContent>
 * </LazyCarousel>
 */

'use client';

import dynamic from 'next/dynamic';

// Lazy-load carousel components - embla-carousel is heavy (~50KB)
export const LazyCarousel = dynamic(
  () =>
    import('./carousel').then(mod => ({
      default: mod.Carousel,
    })),
  {
    ssr: false, // Carousels are typically client-only
    loading: () => (
      <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
        Loading carousel...
      </div>
    ),
  }
);

export const LazyCarouselContent = dynamic(
  () =>
    import('./carousel').then(mod => ({
      default: mod.CarouselContent,
    })),
  {
    ssr: false,
  }
);

export const LazyCarouselItem = dynamic(
  () =>
    import('./carousel').then(mod => ({
      default: mod.CarouselItem,
    })),
  {
    ssr: false,
  }
);

export const LazyCarouselPrevious = dynamic(
  () =>
    import('./carousel').then(mod => ({
      default: mod.CarouselPrevious,
    })),
  {
    ssr: false,
  }
);

export const LazyCarouselNext = dynamic(
  () =>
    import('./carousel').then(mod => ({
      default: mod.CarouselNext,
    })),
  {
    ssr: false,
  }
);

// Export types
export type { CarouselApi } from './carousel';

