/**
 * Global error handler for unhandled promise rejections
 * This helps suppress browser extension errors that we can't control
 */
if (typeof window !== 'undefined') {
  // Handle unhandled promise rejections (often from browser extensions)
  window.addEventListener('unhandledrejection', event => {
    // Suppress errors from browser extensions (message channel errors)
    const errorMessage = event.reason?.message || String(event.reason || '');
    const errorString = String(event.reason || '');

    if (
      errorMessage.includes('message channel') ||
      errorMessage.includes('asynchronous response') ||
      errorMessage.includes('message channel closed') ||
      errorMessage.includes('listener indicated an asynchronous response') ||
      errorString.includes('message channel') ||
      errorString.includes('asynchronous response') ||
      errorMessage.includes('chrome-extension://') ||
      errorMessage.includes('moz-extension://') ||
      errorMessage.includes('safari-extension://')
    ) {
      // Silently ignore browser extension errors
      event.preventDefault();
      return;
    }

    // Log other errors for debugging (optional)
    // console.error('Unhandled promise rejection:', event.reason);
  });

  // Handle font loading errors gracefully
  if (document.fonts) {
    document.fonts.ready.catch(() => {
      // Silently handle font loading errors
    });
  }
}
