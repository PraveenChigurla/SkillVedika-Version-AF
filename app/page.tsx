import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Hero from '@/components/home/hero';
import HomePageClient from './HomePageClient';
import LCPPreload from '@/components/home/LCPPreload';
import { StructuredData } from '@/lib/structuredData';
import { getBaseSchemas } from '@/lib/getBaseSchemas';
import { Suspense } from 'react';

// Lazy load heavy components below the fold - SSR enabled for faster initial load
const KeyFeatures = dynamic(() => import('@/components/home/key-features'), {
  ssr: true,
});
const JobAssistance = dynamic(() => import('@/components/home/job-assistance'), {
  ssr: true,
});
const JobProgrammeSupport = dynamic(() => import('@/components/home/job-programme-support'), {
  ssr: true,
});
const RecentBlog = dynamic(() => import('@/components/home/recent-blog'), {
  ssr: true,
});

import { getApiUrl } from '@/lib/apiConfig';

// Fetch homepage data on server with timeout - optimized
async function getHomePageData() {
  try {
    const apiUrl = getApiUrl('/homepage');

    // Use Promise.race for more reliable timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 2000); // 2 second timeout
    });

    const fetchPromise = (async () => {
      const res = await fetch(apiUrl, {
        next: { revalidate: 3600 }, // Cache for 1 hour, revalidate in background
        headers: {
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        // Log 500 errors in development for debugging
        if (process.env.NODE_ENV === 'development' && res.status >= 500) {
          console.warn('[Homepage] Backend returned', res.status, 'for /homepage');
        }
        return null;
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return null;
      }

      const data = await res.json();
      return data;
    })();

    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error) {
    // Log timeout in development
    if (
      process.env.NODE_ENV === 'development' &&
      error instanceof Error &&
      error.message.includes('Timeout')
    ) {
      console.warn('[Homepage] Fetch timeout - backend may be slow');
    }
    // Silently fail - return null for graceful fallback
    return null;
  }
}

// Fetch blogs on server with timeout - optimized
async function getBlogs() {
  try {
    const apiUrl = getApiUrl('/blogs?recent=yes');

    // Use Promise.race for more reliable timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 2000); // 2 second timeout
    });

    const fetchPromise = (async () => {
      const res = await fetch(apiUrl, {
        next: { revalidate: 1800 }, // Cache for 30 minutes
        headers: {
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        return [];
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return [];
      }

      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.slice(0, 6);
      }

      // Skip fallback to avoid additional delay - just return empty array
      return [];
    })();

    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error) {
    // Silently fail - return empty array
    return [];
  }
}

// Generate metadata on server
export async function generateMetadata(): Promise<Metadata> {
  try {
    const apiUrl = getApiUrl('/seo?slug=home');

    // Use Promise.race for more reliable timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 2000); // 2 second timeout
    });

    const fetchPromise = (async (): Promise<Metadata | null> => {
      const res = await fetch(apiUrl, {
        next: { revalidate: 86400 }, // Cache for 24 hours
        headers: {
          Accept: 'application/json',
        },
      });

      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const json = await res.json();
          const seo = json?.data ?? json;

          if (seo) {
            return {
              title: seo.meta_title || 'SkillVedika - Online Courses & Professional Training',
              description:
                seo.meta_description ||
                'Industry-ready online courses, corporate training, and job support programs.',
              keywords: seo.meta_keywords || [
                'online courses',
                'IT training',
                'professional development',
              ],
              openGraph: {
                title: seo.meta_title || 'SkillVedika - Online Courses & Professional Training',
                description:
                  seo.meta_description ||
                  'Industry-ready online courses, corporate training, and job support programs.',
                images: seo.og_image ? [seo.og_image] : undefined,
              },
              twitter: {
                card: 'summary_large_image',
                title: seo.meta_title || 'SkillVedika - Online Courses & Professional Training',
                description:
                  seo.meta_description ||
                  'Industry-ready online courses, corporate training, and job support programs.',
              },
            };
          }
        }
      }
      return null;
    })();

    const result = await Promise.race([fetchPromise, timeoutPromise]);
    if (result) {
      return result;
    }
  } catch (error) {
    // Silently fail and use fallback
  }

  // Fallback metadata - always ensure description is present
  const { getCanonicalUrl } = await import('@/lib/seo');
  const canonicalUrl = getCanonicalUrl('/');

  return {
    title: 'SkillVedika - Online Courses & Professional Training',
    description:
      'Industry-ready online courses, corporate training, and job support programs designed to help professionals grow their careers in IT and technology.',
    keywords: [
      'online courses',
      'IT training',
      'professional development',
      'corporate training',
      'job support',
      'SkillVedika',
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: 'SkillVedika - Online Courses & Professional Training',
      description:
        'Industry-ready online courses, corporate training, and job support programs designed to help professionals grow their careers in IT and technology.',
      type: 'website',
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'SkillVedika - Online Courses & Professional Training',
      description:
        'Industry-ready online courses, corporate training, and job support programs designed to help professionals grow their careers in IT and technology.',
    },
  };
}

export default async function Home() {
  // Fetch data in parallel on the server with Promise.allSettled for better error handling
  const [homeResult, blogsResult] = await Promise.allSettled([getHomePageData(), getBlogs()]);

  // Extract data from results, handling both success and failure
  const home = homeResult.status === 'fulfilled' ? homeResult.value : null;
  const blogs = blogsResult.status === 'fulfilled' ? blogsResult.value : [];

  // Always render something - even if API fails, show basic structure
  // This ensures FCP happens quickly for Lighthouse
  const lcpImageUrl = home?.hero_image || '/home/Frame 162.png';
  // Normalize and encode URL properly to avoid preload warnings
  const normalizedLcpUrl = lcpImageUrl.startsWith('http')
    ? lcpImageUrl
    : lcpImageUrl.startsWith('/')
      ? lcpImageUrl
      : `/${lcpImageUrl}`;

  // Generate structured data for SEO - wrap in timeout to prevent hangs
  let organizationSchema = {},
    websiteSchema = {},
    webPageSchema = {};
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://skillvedika.com';

    // Add timeout to prevent hanging
    const schemaTimeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Schema generation timeout')), 3000);
    });

    const schemaPromise = (async () => {
      const [org, web] = await getBaseSchemas();
      const { generateWebPageSchema } = await import('@/lib/structuredData');
      const webPage = generateWebPageSchema(siteUrl, {
        name: 'SkillVedika - Online IT Training & Career Development',
        description:
          'SkillVedika offers industry-ready online courses, corporate training, and job support programs designed to help professionals grow their careers in IT and technology.',
        inLanguage: 'en-US',
        siteName: 'SkillVedika',
        siteUrl: siteUrl,
        organizationName: 'SkillVedika',
        organizationUrl: siteUrl,
      });
      return { org, web, webPage };
    })();

    const result = await Promise.race([schemaPromise, schemaTimeout]);
    organizationSchema = result.org;
    websiteSchema = result.web;
    webPageSchema = result.webPage;
  } catch (error) {
    // Fallback to empty schemas if generation fails or times out
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[Homepage] Failed to generate structured data:',
        error instanceof Error ? error.message : error
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#F0F4F9] overflow-x-hidden w-full max-w-full">
      {/* Structured Data for SEO */}
      <StructuredData data={[organizationSchema, websiteSchema, webPageSchema]} />

      {/* Preload LCP image for faster loading */}
      <LCPPreload imageUrl={normalizedLcpUrl} />

      {/* Always render Hero - it handles missing data gracefully */}
      {home ? (
        <>
          <Suspense fallback={null}>
            <Hero hero={home} />
          </Suspense>

          <Suspense fallback={null}>
            <HomePageClient explore={home} />
          </Suspense>

          <KeyFeatures keyFeatures={home} />
          <JobAssistance jobAssist={home} />
          <JobProgrammeSupport jobSupport={home} />
          <RecentBlog blogs={blogs} blogHeading={home.blog_section_heading} />
        </>
      ) : (
        // Fallback UI - render basic homepage structure even without data
        <>
          <Suspense fallback={null}>
            <Hero hero={undefined} />
          </Suspense>

          <Suspense fallback={null}>
            <HomePageClient explore={undefined} />
          </Suspense>

          <KeyFeatures keyFeatures={undefined} />
          <JobAssistance jobAssist={undefined} />
          <JobProgrammeSupport jobSupport={undefined} />
          <RecentBlog blogs={[]} blogHeading={undefined} />
        </>
      )}
    </main>
  );
}
