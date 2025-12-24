/**
 * Helper function to safely fetch and parse JSON
 * Handles cases where API returns HTML error pages instead of JSON
 */
export async function safeFetchJson<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...options?.headers,
      },
      signal: options?.signal, // Support AbortController
    });

    // Check if response is ok
    if (!res.ok) {
      return { data: null, error: `HTTP ${res.status}` };
    }

    // Check content type
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return { data: null, error: 'Invalid content type' };
    }

    // Parse JSON
    const data = await res.json();
    return { data: data as T, error: null };
  } catch (err: unknown) {
    // Silently handle errors in server components
    const errorMessage = err instanceof Error ? err.message : 'Network error';
    return { data: null, error: errorMessage };
  }
}
