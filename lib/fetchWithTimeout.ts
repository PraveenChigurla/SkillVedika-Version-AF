/**
 * Fetch utility with timeout support
 *
 * Prevents hanging requests by automatically aborting after a specified timeout.
 * Useful for preventing performance issues and improving user experience.
 */

interface FetchWithTimeoutOptions extends RequestInit {
  timeout?: number;
}

const DEFAULT_TIMEOUT = 10000; // 10 seconds

/**
 * Fetches a resource with automatic timeout
 *
 * @param url - The URL to fetch
 * @param options - Fetch options including optional timeout
 * @returns Promise that resolves to Response or rejects with timeout error
 *
 * @example
 * const response = await fetchWithTimeout('/api/courses', {
 *   timeout: 5000, // 5 second timeout
 *   headers: { 'Accept': 'application/json' }
 * });
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}
