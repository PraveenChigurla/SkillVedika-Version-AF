'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';

export default function MapSection({
  title,
  subtitle,
  mapLink,
  mapLinkIndia,
}: {
  title: { part1?: string; part2?: string; text?: string } | null;
  subtitle: string;
  mapLink: string;
  mapLinkIndia?: string;
}) {
  // Debug: Log map links in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Map Links:', { mapLink, mapLinkIndia });
    }
  }, [mapLink, mapLinkIndia]);

  // Suppress Google Maps API referrer errors (non-critical for iframe embeds)
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args: any[]) => {
      // Suppress Google Maps referrer errors - these are non-critical for iframe embeds
      if (
        args[0]?.includes?.('RefererNotAllowedMapError') ||
        args[0]?.includes?.('referer-not-allowed-map-error')
      ) {
        // Silently ignore - iframe embeds don't require API key restrictions
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  const hasParts = Boolean(
    (title?.part1 && title.part1.trim()) || (title?.part2 && title.part2.trim())
  );

  const headingPart1 = hasParts
    ? (title?.part1 ?? title?.text ?? '')
    : (title?.text ?? 'Visit Our');
  const headingPart2 = hasParts ? (title?.part2 ?? '') : '';

  return (
    <section className="relative w-full py-24 overflow-hidden bg-gradient-to-b from-background to-background/80">
      {/* Animated Background Glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent opacity-70"
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Heading Section */}
      <div className="text-center mb-16 relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          {headingPart1}{' '}
          {headingPart2 ? (
            <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              {headingPart2}
            </span>
          ) : null}
        </h2>

        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {subtitle ||
            'We’re located across the globe to serve you better — explore our headquarters on the map below.'}
        </p>
      </div>

      {/* Map Wrapper */}
      <motion.div
        className="relative max-w-7xl mx-auto px-4 md:px-8"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Grid for both maps */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* USA Office Map */}
          {mapLink ? (
            <div className="relative rounded-3xl overflow-hidden shadow-strong border border-border group">
              {/* Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700"></div>

              {/* Map Frame */}
              <div className="relative z-10 rounded-3xl overflow-hidden border border-border/40 shadow-inner transition-transform duration-700 group-hover:scale-[1.01]">
                <h3 className="absolute top-4 left-4 z-20 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold text-gray-900">
                  USA Office
                </h3>
                <iframe
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  src={mapLink}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-[400px] grayscale-[30%] hover:grayscale-0 transition-all duration-700"
                  title="USA Office Location"
                />
              </div>

              {/* Decorative Corners */}
              <div className="absolute -top-2 -left-2 w-24 h-24 border-l-4 border-t-4 border-primary/70 rounded-tl-3xl opacity-40 group-hover:opacity-70 transition-opacity duration-700"></div>
              <div className="absolute -bottom-2 -right-2 w-24 h-24 border-r-4 border-b-4 border-accent/70 rounded-br-3xl opacity-40 group-hover:opacity-70 transition-opacity duration-700"></div>
            </div>
          ) : (
            <div className="relative rounded-3xl overflow-hidden shadow-strong border border-border bg-gray-100 flex items-center justify-center min-h-[400px]">
              <div className="text-center p-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">USA Office</h3>
                <p className="text-gray-600 text-sm">Map link not configured</p>
              </div>
            </div>
          )}

          {/* India Office Map */}
          {mapLinkIndia ? (
            <div className="relative rounded-3xl overflow-hidden shadow-strong border border-border group">
              {/* Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700"></div>

              {/* Map Frame */}
              <div className="relative z-10 rounded-3xl overflow-hidden border border-border/40 shadow-inner transition-transform duration-700 group-hover:scale-[1.01]">
                <h3 className="absolute top-4 left-4 z-20 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold text-gray-900">
                  India Office
                </h3>
                <iframe
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  src={mapLinkIndia}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-[400px] grayscale-[30%] hover:grayscale-0 transition-all duration-700"
                  title="India Office Location"
                />
              </div>

              {/* Decorative Corners */}
              <div className="absolute -top-2 -left-2 w-24 h-24 border-l-4 border-t-4 border-primary/70 rounded-tl-3xl opacity-40 group-hover:opacity-70 transition-opacity duration-700"></div>
              <div className="absolute -bottom-2 -right-2 w-24 h-24 border-r-4 border-b-4 border-accent/70 rounded-br-3xl opacity-40 group-hover:opacity-70 transition-opacity duration-700"></div>
            </div>
          ) : (
            <div className="relative rounded-3xl overflow-hidden shadow-strong border border-border bg-gray-100 flex items-center justify-center min-h-[400px]">
              <div className="text-center p-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">India Office</h3>
                <p className="text-gray-600 text-sm">Map link not configured</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Floating Blobs */}
      <motion.div
        className="absolute top-10 right-[15%] w-16 h-16 bg-primary/30 rounded-full blur-xl opacity-50"
        animate={{ y: [0, -10, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-10 left-[10%] w-20 h-20 bg-accent/30 rounded-full blur-xl opacity-50"
        animate={{ y: [0, 10, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
    </section>
  );
}
