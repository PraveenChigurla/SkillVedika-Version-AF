/**
 * Global error handler for unhandled promise rejections
 * This helps suppress browser extension errors that we can't control
 */
if (typeof window !== 'undefined') {
  // Handle unhandled promise rejections (often from browser extensions)
  window.addEventListener('unhandledrejection', event => {
    try {
      // Handle undefined/null errors gracefully
      if (event.reason === undefined || event.reason === null) {
        // Silently ignore undefined/null rejections (often from browser extensions or Next.js internals)
        event.preventDefault();
        return;
      }

      // Safely extract error message
      let errorMessage = '';
      let errorString = '';
      
      try {
        if (typeof event.reason === 'object' && event.reason !== null) {
          errorMessage = event.reason.message || String(event.reason);
        } else {
          errorMessage = String(event.reason);
        }
        errorString = String(event.reason);
      } catch (e) {
        // If we can't stringify, just prevent default
        event.preventDefault();
        return;
      }

      // Suppress errors from browser extensions (message channel errors)
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

      // For other errors, prevent default to avoid console noise
      // but you can uncomment the log below for debugging
      event.preventDefault();
      // console.error('Unhandled promise rejection:', event.reason);
    } catch (e) {
      // If error handler itself fails, prevent default to avoid infinite loops
      event.preventDefault();
    }
  });

  // Handle font loading errors gracefully
  if (document.fonts) {
    document.fonts.ready.catch(() => {
      // Silently handle font loading errors
    });
  }

  // Handle general errors
  window.addEventListener('error', event => {
    // Suppress known harmless errors
    if (
      event.message?.includes('message channel') ||
      event.message?.includes('chrome-extension://') ||
      event.message?.includes('moz-extension://') ||
      event.message?.includes('safari-extension://')
    ) {
      event.preventDefault();
    }
  });
}
