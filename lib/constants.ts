/**
 * Application-wide constants
 *
 * Centralizes magic numbers and configuration values
 * to improve maintainability and reduce duplication.
 */

/**
 * API request timeout values (in milliseconds)
 */
export const API_TIMEOUTS = {
  DEFAULT: 10000, // 10 seconds
  SHORT: 5000, // 5 seconds
  LONG: 30000, // 30 seconds
} as const;

/**
 * Cache revalidation intervals (in seconds)
 */
export const CACHE_REVALIDATION = {
  FOOTER: 3600, // 1 hour
  COURSES: 300, // 5 minutes
  HOMEPAGE: 3600, // 1 hour
  BLOGS: 86400, // 24 hours
} as const;

/**
 * Email validation constants
 */
export const EMAIL_VALIDATION = {
  MAX_LENGTH: 254, // RFC 5321 limit
  REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

/**
 * Request deferral timeouts (in milliseconds)
 */
export const DEFER_TIMEOUTS = {
  FOOTER_SETTINGS: 2000,
  FIRST_COURSE: 3000,
  DEFAULT: 1000,
} as const;
