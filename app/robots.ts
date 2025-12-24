/**
 * robots.txt Generator
 *
 * Generates robots.txt following Google Search Central best practices.
 * Allows crawling of all public pages, blocks admin/internal routes.
 *
 * Accessible at: /robots.txt
 */

import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/api/',
          '/_next/',
          '/auth/',
          '/login',
          '/logout',
          '/test/',
          '/internal/',
          // Block query parameters that might cause duplicate content
          '/*?*utm_*',
          '/*?*ref=*',
          '/*?*source=*',
        ],
      },
      // Allow Googlebot to crawl everything (except disallowed paths)
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/api/',
          '/_next/',
          '/auth/',
          '/login',
          '/logout',
          '/test/',
          '/internal/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
