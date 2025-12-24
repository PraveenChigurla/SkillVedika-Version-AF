// Font error handler - suppresses 404 errors for missing font files
// This handles cases where Next.js or third-party libraries try to load fonts
// that don't exist locally (e.g., from /fonts/ directory)

if (typeof window !== 'undefined') {
  // Suppress console errors for font 404s
  const originalError = console.error;
  console.error = function (...args: any[]) {
    const message = args.join(' ');
    // Suppress 404 errors for font files in /fonts/ directory
    if (
      typeof message === 'string' &&
      (message.includes('/fonts/') || message.includes('KFOmCnqEu92Fr1Mu4mxK')) &&
      (message.includes('404') ||
        message.includes('Failed to load') ||
        message.includes('ERR_ABORTED'))
    ) {
      // Silently ignore font 404 errors - browser will use fallback fonts
      return;
    }
    // Log other errors normally
    originalError.apply(console, args);
  };

  // Handle network errors for font files
  window.addEventListener(
    'error',
    event => {
      const target = event.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'LINK' || target.tagName === 'STYLE') &&
        event.message &&
        (event.message.includes('/fonts/') || event.message.includes('KFOmCnqEu92Fr1Mu4mxK'))
      ) {
        // Prevent font loading errors from showing in console
        event.preventDefault();
        event.stopPropagation();
      }
    },
    true
  );
}
