/**
 * Centralized API configuration utility
 *
 * Provides consistent API URL normalization across the application.
 * Ensures all API calls use the correct base URL format.
 */

/**
 * Normalizes and constructs a complete API URL from an endpoint
 *
 * @param endpoint - The API endpoint (e.g., '/courses' or 'courses')
 * @returns Complete API URL with proper /api prefix
 *
 * @example
 * getApiUrl('/courses') // 'http://localhost:8000/api/courses'
 * getApiUrl('courses') // 'http://localhost:8000/api/courses'
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (cleanBase.endsWith('/api')) {
    return `${cleanBase}${cleanEndpoint}`;
  }
  return `${cleanBase}/api${cleanEndpoint}`;
}

/**
 * Gets the base API URL (without endpoint)
 *
 * @returns Base API URL with /api suffix
 */
export function getApiBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const cleanBase = baseUrl.replace(/\/$/, '');

  if (cleanBase.endsWith('/api')) {
    return cleanBase;
  }
  return `${cleanBase}/api`;
}

/**
 * Validates that API URL is configured
 *
 * @returns true if API URL is configured, false otherwise
 */
export function isApiUrlConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_API_URL;
}
