/**
 * Environment-aware logging utility
 *
 * Prevents console statements from cluttering production builds
 * while maintaining error visibility for debugging.
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Logger utility that conditionally logs based on environment
 */
export const logger = {
  /**
   * Logs informational messages (development only)
   */
  log: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Logs warning messages (development only)
   */
  warn: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Logs error messages (always logged, even in production)
   * Errors should always be visible for monitoring
   */
  error: (...args: unknown[]): void => {
    console.error(...args);
  },

  /**
   * Logs info messages (development only)
   */
  info: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  /**
   * Logs debug messages (development only)
   */
  debug: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
};

/**
 * Creates a scoped logger with a prefix
 *
 * @param scope - The scope/context name (e.g., 'API', 'Component')
 * @returns Logger instance with prefixed messages
 *
 * @example
 * const apiLogger = createScopedLogger('API');
 * apiLogger.log('Fetching courses'); // [API] Fetching courses
 */
export function createScopedLogger(scope: string) {
  return {
    log: (...args: unknown[]) => logger.log(`[${scope}]`, ...args),
    warn: (...args: unknown[]) => logger.warn(`[${scope}]`, ...args),
    error: (...args: unknown[]) => logger.error(`[${scope}]`, ...args),
    info: (...args: unknown[]) => logger.info(`[${scope}]`, ...args),
    debug: (...args: unknown[]) => logger.debug(`[${scope}]`, ...args),
  };
}
