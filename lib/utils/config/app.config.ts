/**
 * Application Configuration
 *
 * Centralized configuration for the entire application.
 * Environment-specific values should be set via environment variables.
 */

/**
 * Application metadata
 */
export const APP_CONFIG = {
  name: 'SkillVedika',
  description: 'Online Courses & Professional Training',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://skillvedika.com',
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@skillvedika.com',
  contactPhone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '+91-XXXXXXXXXX',
} as const;

/**
 * API Configuration
 */
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000', 10),
  retryAttempts: parseInt(process.env.NEXT_PUBLIC_API_RETRY_ATTEMPTS || '3', 10),
  retryDelay: parseInt(process.env.NEXT_PUBLIC_API_RETRY_DELAY || '1000', 10),
} as const;

/**
 * SEO Configuration
 */
export const SEO_CONFIG = {
  defaultTitle: 'SkillVedika - Online Courses & Professional Training',
  defaultDescription:
    'SkillVedika offers industry-ready online courses, corporate training, and job support programs designed to help professionals grow their careers in IT and technology.',
  defaultKeywords: [
    'online courses',
    'IT training',
    'professional development',
    'corporate training',
    'job support',
    'SkillVedika',
  ],
  twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE || '@skillvedika',
  ogImage: `${APP_CONFIG.url}/og-image.jpg`,
} as const;

/**
 * Feature Flags
 */
export const FEATURE_FLAGS = {
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  enableWhatsApp: process.env.NEXT_PUBLIC_ENABLE_WHATSAPP === 'true',
  enableCookieConsent: process.env.NEXT_PUBLIC_ENABLE_COOKIE_CONSENT !== 'false',
} as const;

/**
 * Performance Configuration
 */
export const PERFORMANCE_CONFIG = {
  imageQuality: 85,
  imageFormats: ['image/avif', 'image/webp'] as const,
  lazyLoadOffset: 200, // pixels before viewport to start loading
} as const;

/**
 * Security Configuration
 */
export const SECURITY_CONFIG = {
  cspNonce: process.env.NEXT_PUBLIC_CSP_NONCE || '',
  enableHSTS: process.env.NEXT_PUBLIC_ENABLE_HSTS === 'true',
  hstsMaxAge: 31536000, // 1 year in seconds
} as const;
