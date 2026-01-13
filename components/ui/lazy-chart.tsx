/**
 * Lazy-loaded Chart Components
 * 
 * Performance: Lazy-loads recharts library to reduce initial bundle size.
 * 
 * IMPORTANT: When using charts, wrap the entire chart component usage in dynamic import.
 * 
 * Example usage:
 * 'use client';
 * import dynamic from 'next/dynamic';
 * 
 * const ChartContainer = dynamic(
 *   () => import('@/components/ui/chart').then(mod => mod.ChartContainer),
 *   { ssr: false }
 * );
 * 
 * This ensures recharts (~200KB) is only loaded when charts are actually rendered.
 */

// Re-export types for convenience
export type { ChartConfig } from './chart';

