/**
 * Error Handling Utilities
 *
 * Centralized error handling and logging utilities
 * for consistent error management across the application.
 */

import { ApiError } from '@/services/api.service';

/**
 * Error types
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Application error class
 */
export class AppError extends Error {
  constructor(
    message: string,
    public type: ErrorType = ErrorType.UNKNOWN,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Convert various error types to AppError
 */
export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ApiError) {
    return new AppError(
      error.message,
      mapApiErrorToType(error.statusCode),
      error.statusCode,
      error
    );
  }

  if (error instanceof Error) {
    return new AppError(error.message, ErrorType.UNKNOWN, undefined, error);
  }

  return new AppError('An unexpected error occurred', ErrorType.UNKNOWN, undefined, error);
}

/**
 * Map HTTP status codes to error types
 */
function mapApiErrorToType(statusCode?: number): ErrorType {
  if (!statusCode) {
    return ErrorType.NETWORK;
  }

  if (statusCode >= 500) {
    return ErrorType.SERVER;
  }

  if (statusCode === 401) {
    return ErrorType.AUTHENTICATION;
  }

  if (statusCode === 403) {
    return ErrorType.AUTHORIZATION;
  }

  if (statusCode === 404) {
    return ErrorType.NOT_FOUND;
  }

  if (statusCode >= 400 && statusCode < 500) {
    return ErrorType.VALIDATION;
  }

  return ErrorType.API;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: AppError): string {
  switch (error.type) {
    case ErrorType.NETWORK:
      return 'Unable to connect to the server. Please check your internet connection.';
    case ErrorType.NOT_FOUND:
      return 'The requested resource was not found.';
    case ErrorType.AUTHENTICATION:
      return 'Authentication required. Please log in.';
    case ErrorType.AUTHORIZATION:
      return 'You do not have permission to perform this action.';
    case ErrorType.VALIDATION:
      return error.message || 'Please check your input and try again.';
    case ErrorType.SERVER:
      return 'Server error. Please try again later.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Log error (server-side only)
 */
export function logError(error: AppError, context?: Record<string, unknown>): void {
  if (typeof window !== 'undefined') {
    // Client-side: use console.error
    console.error('Error:', {
      message: error.message,
      type: error.type,
      statusCode: error.statusCode,
      context,
    });
    return;
  }

  // Server-side: could integrate with logging service
  // For now, use console.error
  console.error('Server Error:', {
    message: error.message,
    type: error.type,
    statusCode: error.statusCode,
    stack: error.stack,
    context,
  });
}
