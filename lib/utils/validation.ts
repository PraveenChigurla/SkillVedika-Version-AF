/**
 * Validation Utilities
 *
 * Centralized validation functions for form inputs and data
 */

import { EMAIL_VALIDATION } from '@/lib/constants';

/**
 * Validate email address
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  if (email.length > EMAIL_VALIDATION.MAX_LENGTH) {
    return false;
  }

  return EMAIL_VALIDATION.REGEX.test(email.trim());
}

/**
 * Validate phone number (basic validation)
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Check if it has reasonable length (7-15 digits)
  return digits.length >= 7 && digits.length <= 15;
}

/**
 * Validate Indian phone number
 */
export function validateIndianPhone(phone: string): boolean {
  if (!validatePhone(phone)) {
    return false;
  }

  const digits = phone.replace(/\D/g, '');

  // Indian numbers should start with 6-9 and have 10 digits
  return /^[6-9][0-9]{9}$/.test(digits);
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string, maxLength?: number): string {
  if (typeof input !== 'string') {
    return '';
  }

  let sanitized = input.trim();

  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Validate URL
 */
export function validateUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Validate required field
 */
export function isRequired(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return true;
}
