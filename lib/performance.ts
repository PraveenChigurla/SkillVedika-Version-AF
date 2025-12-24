/**
 * Performance utilities to reduce Total Blocking Time (TBT)
 * and improve main thread performance
 */

/**
 * Break up long-running tasks using requestIdleCallback or setTimeout
 * This helps reduce TBT by yielding to the browser between chunks
 */
export function runInIdle<T>(callback: () => T, timeout: number = 100): Promise<T> {
  return new Promise(resolve => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(
        () => {
          resolve(callback());
        },
        { timeout }
      );
    } else {
      setTimeout(() => {
        resolve(callback());
      }, 0);
    }
  });
}

/**
 * Defer non-critical work until after initial render
 * Useful for analytics, non-critical animations, etc.
 */
export function deferWork(callback: () => void, delay: number = 1000): void {
  if (typeof window === 'undefined') return;

  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout: delay });
  } else {
    setTimeout(callback, delay);
  }
}

/**
 * Throttle function calls to reduce main thread work
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Debounce function calls to reduce unnecessary executions
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function (this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
