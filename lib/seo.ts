/**
 * SEO Utility Functions
 *
 * Centralized SEO helpers for canonical URLs, sitemap generation, etc.
 * Follows Google Search Central best practices.
 */

/**
 * Get the base site URL from environment variables
 * Defaults to production URL if not set
 */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://skillvedika.com';
}

/**
 * Generate absolute canonical URL for a given path
 *
 * @param path - Relative path (e.g., '/courses', '/blog/my-post')
 * @returns Absolute HTTPS URL
 *
 * @example
 * getCanonicalUrl('/courses') // 'https://skillvedika.com/courses'
 */
export function getCanonicalUrl(path: string): string {
  const baseUrl = getSiteUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Check if a route should be indexed
 * Excludes admin, auth, API, and internal routes
 *
 * @param path - Route path to check
 * @returns true if route should be indexed
 */
export function shouldIndexRoute(path: string): boolean {
  const excludedPaths = [
    '/admin',
    '/dashboard',
    '/api',
    '/_next',
    '/auth',
    '/login',
    '/logout',
    '/test',
    '/internal',
  ];

  return !excludedPaths.some(excluded => path.startsWith(excluded));
}

/**
 * Format date for sitemap (ISO 8601 format)
 *
 * @param date - Date object or string
 * @returns ISO 8601 formatted date string
 */
export function formatSitemapDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString();
}

/**
 * Get priority for a route based on its importance
 *
 * @param path - Route path
 * @returns Priority value (0.0 to 1.0)
 */
export function getRoutePriority(path: string): number {
  // Homepage gets highest priority
  if (path === '/' || path === '') return 1.0;

  // Main pages get high priority
  if (['/courses', '/blog', '/about-us', '/contact-us'].includes(path)) {
    return 0.9;
  }

  // Course and blog detail pages get medium-high priority
  if (path.startsWith('/course-details/') || path.startsWith('/blog/')) {
    return 0.8;
  }

  // Other pages get medium priority
  return 0.7;
}

/**
 * Get change frequency for a route
 *
 * @param path - Route path
 * @returns Change frequency string
 */
export function getChangeFrequency(
  path: string
): 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' {
  // Homepage and main pages change frequently
  if (path === '/' || ['/courses', '/blog'].includes(path)) {
    return 'daily';
  }

  // Course and blog detail pages change less frequently
  if (path.startsWith('/course-details/') || path.startsWith('/blog/')) {
    return 'weekly';
  }

  // Static pages change rarely
  return 'monthly';
}

/**
 * Generate meta title with template
 */
export function generateMetaTitle(title?: string, template = '%s | SkillVedika'): string {
  if (!title) {
    return 'SkillVedika - Online Courses & Professional Training';
  }
  return template.replace('%s', title);
}

/**
 * Generate meta description (truncate to 160 characters)
 */
export function generateMetaDescription(description?: string, maxLength = 160): string {
  if (!description) {
    return 'SkillVedika offers industry-ready online courses, corporate training, and job support programs designed to help professionals grow their careers in IT and technology.';
  }

  if (description.length <= maxLength) {
    return description;
  }

  // Truncate at word boundary
  const truncated = description.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}

/**
 * Generate Open Graph image URL
 */
export function generateOgImageUrl(image?: string, defaultImage = '/og-image.jpg'): string {
  if (!image) {
    return `${getSiteUrl()}${defaultImage}`;
  }

  // If already absolute URL, return as is
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }

  // Make relative URLs absolute
  const cleanImage = image.startsWith('/') ? image : `/${image}`;
  return `${getSiteUrl()}${cleanImage}`;
}
