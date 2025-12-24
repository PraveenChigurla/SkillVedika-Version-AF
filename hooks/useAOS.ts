'use client';

import { useEffect } from 'react';

let aosLoaded = false;
let aosLoading = false;

export function useAOS() {
  useEffect(() => {
    // Only load AOS if not already loaded or loading
    if (aosLoaded || aosLoading) return;

    aosLoading = true;

    // Dynamically import AOS
    Promise.all([
      import('aos'),
      // @ts-expect-error - CSS files don't have type declarations
      import('aos/dist/aos.css').catch(() => null),
    ])
      .then(([AOSModule]) => {
        const AOS = AOSModule.default;
        AOS.init({ duration: 800, once: true });
        aosLoaded = true;
        aosLoading = false;
      })
      .catch(err => {
        console.error('Failed to load AOS:', err);
        aosLoading = false;
      });
  }, []);
}
