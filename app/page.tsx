import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Hero from '@/components/home/hero';
import HomePageClient from './HomePageClient';
import LCPPreload from '@/components/home/LCPPreload';
import { StructuredData } from '@/lib/structuredData';
import { getBaseSchemas } from '@/lib/getBaseSchemas';

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

    // Reduced timeout for faster fallback
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const res = await fetch(apiUrl, {
      next: { revalidate: 3600 }, // Cache for 1 hour, revalidate in background
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return null;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    // Silently fail - return null for graceful fallback
    return null;
  }
}

// Fetch blogs on server with timeout - optimized
async function getBlogs() {
  try {
    const apiUrl = getApiUrl('/blogs?recent=yes');

    // Reduced timeout for faster fallback
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const res = await fetch(apiUrl, {
      next: { revalidate: 1800 }, // Cache for 30 minutes
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

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

    // Fallback to all blogs (with shorter timeout)
    const fallbackUrl = getApiUrl('/blogs');
    const fallbackController = new AbortController();
    const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 2000); // 2s fallback

    const fallbackRes = await fetch(fallbackUrl, {
      next: { revalidate: 1800 },
      headers: {
        Accept: 'application/json',
      },
      signal: fallbackController.signal,
    });

    clearTimeout(fallbackTimeoutId);

    if (fallbackRes.ok) {
      const fallbackData = await fallbackRes.json();
      return Array.isArray(fallbackData) ? fallbackData.slice(0, 6) : [];
    }

    return [];
  } catch (error) {
    // Silently fail - return empty array
    return [];
  }
}

// Generate metadata on server
export async function generateMetadata(): Promise<Metadata> {
  try {
    const apiUrl = getApiUrl('/seo/1');
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
  } catch (error) {
    console.error('Error generating metadata:', error);
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

  // Generate structured data for SEO
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://skillvedika.com';
  const [organizationSchema, websiteSchema] = await getBaseSchemas();

  // Generate WebPage schema for homepage
  const { generateWebPageSchema } = await import('@/lib/structuredData');
  const webPageSchema = generateWebPageSchema(siteUrl, {
    name: 'SkillVedika - Online IT Training & Career Development',
    description:
      'SkillVedika offers industry-ready online courses, corporate training, and job support programs designed to help professionals grow their careers in IT and technology.',
    inLanguage: 'en-US',
    siteName: 'SkillVedika',
    siteUrl: siteUrl,
    organizationName: 'SkillVedika',
    organizationUrl: siteUrl,
  });

  return (
    <main className="min-h-screen bg-[#F0F4F9]">
      {/* Structured Data for SEO */}
      <StructuredData data={[organizationSchema, websiteSchema, webPageSchema]} />

      {/* Preload LCP image for faster loading */}
      <LCPPreload imageUrl={normalizedLcpUrl} />

      {/* Always render Hero - it handles missing data gracefully */}
      {home ? (
        <>
          <Hero hero={home} />
          <HomePageClient explore={home} />
          <KeyFeatures keyFeatures={home} />
          <JobAssistance jobAssist={home} />
          <JobProgrammeSupport jobSupport={home} />
          <RecentBlog blogs={blogs} blogHeading={home.blog_section_heading} />
        </>
      ) : (
        // Fallback UI that renders immediately for FCP
        <div className="min-h-screen bg-[#F0F4F9] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">SkillVedika</h1>
            <p className="text-gray-500">Loading content...</p>
          </div>
        </div>
      )}
    </main>
  );
}
