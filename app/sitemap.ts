/**
 * Dynamic XML Sitemap Generator
 *
 * Generates sitemap.xml following Google Search Central best practices.
 * Includes all indexable public pages: static pages, courses, blogs, categories.
 *
 * Accessible at: /sitemap.xml
 */

import { MetadataRoute } from 'next';
import { getApiUrl } from '@/lib/apiConfig';
import {
  getCanonicalUrl,
} from '@/lib/seo';

interface Course {
  id: number;
  slug?: string;
  details?: {
    slug?: string;
  };
  updated_at?: string;
}

interface Blog {
  blog_id?: number;
  id?: number;
  slug?: string;
  updated_at?: string;
}

/**
 * Fetch all courses from API
 */
async function getCourses(): Promise<Course[]> {
  try {
    const apiUrl = getApiUrl('/courses');
    const res = await fetch(apiUrl, {
      next: { revalidate: 3600 }, // Revalidate every hour
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      console.warn('[Sitemap] Failed to fetch courses:', res.status);
      return [];
    }

    const data = await res.json();
    // Handle different API response formats
    const courses = Array.isArray(data) ? data : data?.data || data?.courses || [];

    return Array.isArray(courses) ? courses : [];
  } catch (error) {
    console.error('[Sitemap] Error fetching courses:', error);
    return [];
  }
}

/**
 * Fetch all blogs from API
 */
async function getBlogs(): Promise<Blog[]> {
  try {
    const apiUrl = getApiUrl('/blogs');
    const res = await fetch(apiUrl, {
      next: { revalidate: 3600 }, // Revalidate every hour
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      console.warn('[Sitemap] Failed to fetch blogs:', res.status);
      return [];
    }

    const data = await res.json();
    // Handle different API response formats
    const blogs = Array.isArray(data) ? data : data?.data || data?.blogs || [];

    return Array.isArray(blogs) ? blogs : [];
  } catch (error) {
    console.error('[Sitemap] Error fetching blogs:', error);
    return [];
  }
}

/**
 * Generate sitemap entries
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Static pages (always include)
  const staticPages = [
    { path: '', priority: 1.0, changefreq: 'daily' },
    { path: '/courses', priority: 0.9, changefreq: 'daily' },
    { path: '/blog', priority: 0.9, changefreq: 'daily' },
    { path: '/about-us', priority: 0.8, changefreq: 'monthly' },
    { path: '/contact-us', priority: 0.8, changefreq: 'monthly' },
    { path: '/corporate-training', priority: 0.8, changefreq: 'monthly' },
    { path: '/on-job-support', priority: 0.8, changefreq: 'monthly' },
    { path: '/terms', priority: 0.5, changefreq: 'yearly' },
  ];

  // Add static pages
  for (const page of staticPages) {
    sitemapEntries.push({
      url: getCanonicalUrl(page.path),
      lastModified: now,
      changeFrequency: page.changefreq as MetadataRoute.Sitemap[number]['changeFrequency'],
      priority: page.priority,
    });
  }

  // Fetch and add courses
  try {
    const courses = await getCourses();
    for (const course of courses) {
      // Use slug if available, otherwise fall back to ID
      const courseSlug = course.slug || course.details?.slug || course.id;
      const coursePath = `/course-details/${courseSlug}`;

      sitemapEntries.push({
        url: getCanonicalUrl(coursePath),
        lastModified: course.updated_at ? new Date(course.updated_at) : now,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  } catch (error) {
    console.error('[Sitemap] Error processing courses:', error);
  }

  // Fetch and add blogs
  try {
    const blogs = await getBlogs();
    for (const blog of blogs) {
      // Use slug if available, otherwise fall back to ID
      const blogId = blog.blog_id || blog.id;
      const blogSlug = blog.slug || blogId;

      if (!blogSlug) continue; // Skip if no identifier

      const blogPath = `/blog/${blogSlug}`;

      sitemapEntries.push({
        url: getCanonicalUrl(blogPath),
        lastModified: blog.updated_at ? new Date(blog.updated_at) : now,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  } catch (error) {
    console.error('[Sitemap] Error processing blogs:', error);
  }

  // Sort by priority (highest first) for better crawl efficiency
  sitemapEntries.sort((a, b) => (b.priority || 0) - (a.priority || 0));

  return sitemapEntries;
}
