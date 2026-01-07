import dynamic from 'next/dynamic';
import LCPPreload from '@/components/courses/LCPPreload';

// Lazy load components for better performance with loading states
const CourseGrid = dynamic(() => import('@/components/courses/CourseGrid'), {
  loading: () => (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-5 py-0">
      <div className="py-20 text-center text-gray-600">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-4">Loading courses...</p>
      </div>
    </div>
  ),
});

// Lazy load CourseSearchBar - it's not critical for initial render
const CourseSearchBar = dynamic(() => import('@/components/courses/CourseSearchBar'), {
  loading: () => <div className="w-full max-w-2xl h-12 bg-gray-100 rounded-lg animate-pulse"></div>,
  // Note: ssr: false is not allowed in Server Components
  // The component itself is a client component, so it will hydrate on the client
});

// Fetch first course image for LCP preloading - optimized with shorter timeout
async function getFirstCourseImage(): Promise<string | null> {
  try {
    const { getApiUrl } = await import('@/lib/apiConfig');
    const apiUrl = getApiUrl('/courses');
    if (process.env.NODE_ENV === 'development') {
      console.log('[getFirstCourseImage] Fetching from:', `${apiUrl}?limit=1`);
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000); // Reduced to 1s

    const res = await fetch(`${apiUrl}?limit=1`, {
      signal: controller.signal,
      cache: 'force-cache',
      next: { revalidate: 300 },
      headers: { Accept: 'application/json' },
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const courses = data?.data || data || [];
      const firstCourse = Array.isArray(courses) ? courses[0] : null;
      return firstCourse?.image || null;
    }
  } catch (err) {
    // Silently fail - preload is optional
  }
  return null;
}

// FETCH COURSE PAGE CONTENT - optimized with caching and shorter timeout
async function getPageContent() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500); // Reduced to 1.5s for faster fallback

    const { getApiUrl } = await import('@/lib/apiConfig');
    const res = await fetch(getApiUrl('/course-page-content'), {
      signal: controller.signal,
      cache: 'force-cache', // Enable caching for better performance
      next: { revalidate: 300 }, // Revalidate every 5 minutes
      headers: { Accept: 'application/json' },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return getFallbackContent(); // Fast fallback
    }

    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return getFallbackContent(); // Fast fallback
    }

    return await res.json();
  } catch (err) {
    // Fast fallback on any error
    return getFallbackContent();
  }
}

// FALLBACK CONTENT
function getFallbackContent() {
  return {
    heading: 'Explore Our Courses',
    subheading: 'Industry-ready courses designed to upgrade your skills',
    meta_title: 'Courses | SkillVedika',
    meta_description:
      'Explore industry-ready courses designed to upgrade your skills and boost your career.',
  };
}

/* ============================================================
   📌 Dynamic Metadata (Title, Description, Keywords)
============================================================ */
export async function generateMetadata() {
  let content = null;

  try {
    // Fetch SEO metadata for the Courses page from the `seos` table.
    // id = 2 corresponds to "Course Listing" in the seed data.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

    const { getApiUrl } = await import('@/lib/apiConfig');
    const res = await fetch(getApiUrl('/seo/2'), {
      signal: controller.signal,
      cache: 'force-cache', // Enable caching
      next: { revalidate: 3600 }, // Revalidate every hour
      headers: { Accept: 'application/json' },
    });

    clearTimeout(timeoutId);

    if (res.ok) content = await res.json();
  } catch (err) {
    const isAbortError = err instanceof Error && err.name === 'AbortError';
    const isDOMAbortError = err instanceof DOMException && err.name === 'AbortError';
    const isConnectionError = err instanceof Error && 
      (err.message.includes('ECONNREFUSED') || 
       err.message.includes('fetch failed') ||
       (err as any)?.cause?.code === 'ECONNREFUSED');
    // Suppress connection errors during build and abort errors
    // Only log other errors in development
    if (!isAbortError && !isDOMAbortError && !isConnectionError && process.env.NODE_ENV === 'development') {
      console.error('Failed to load course meta:', err);
    }
  }

  const seo = content?.data ?? content;

  // Get canonical URL once for use in both fallback and main return
  const { getCanonicalUrl } = await import('@/lib/seo');
  const canonicalUrl = getCanonicalUrl('/courses');

  if (!seo) {
    return {
      title: 'Courses | SkillVedika',
      description:
        'Explore industry-ready courses designed to upgrade your skills and boost your career.',
      keywords: ['courses', 'skillvedika', 'online learning', 'professional training'],
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: 'Courses | SkillVedika',
        description:
          'Explore industry-ready courses designed to upgrade your skills and boost your career.',
        url: canonicalUrl,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Courses | SkillVedika',
        description:
          'Explore industry-ready courses designed to upgrade your skills and boost your career.',
      },
    };
  }

  const metaTitle = seo.meta_title || 'Courses | SkillVedika';
  const metaDescription =
    seo.meta_description ||
    'Explore industry-ready courses designed to upgrade your skills and boost your career.';

  // Handle meta_keywords as array or string
  let metaKeywords = ['courses', 'skillvedika', 'training programs'];
  if (seo.meta_keywords) {
    if (Array.isArray(seo.meta_keywords)) {
      metaKeywords = seo.meta_keywords;
    } else if (typeof seo.meta_keywords === 'string') {
      metaKeywords = seo.meta_keywords
        .split(',')
        .map((k: string) => k.trim())
        .filter(Boolean);
    }
  }

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywords,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: canonicalUrl,
      type: 'website',
      images: ['/skillvedika-logo.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: ['/skillvedika-logo.png'],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

/* ============================================================
   📌 PAGE COMPONENT
============================================================ */
export default async function CoursesPage(props: any) {
  // Ensure searchParams is resolved in Next.js 16
  const resolved = await props;
  const searchParams = await resolved.searchParams;

  const search = searchParams?.search || '';
  const category = searchParams?.category || '';
  const status = searchParams?.status || '';

  // ⚡ OPTIMIZATION: Run all async operations in parallel instead of sequentially
  // This significantly reduces page load time
  const [
    content,
    firstCourseImage,
    { getBaseSchemas },
    { generateCollectionPageSchema },
    { StructuredData },
    { getCanonicalUrl },
  ] = await Promise.all([
    getPageContent(),
    getFirstCourseImage(),
    import('@/lib/getBaseSchemas'),
    import('@/lib/structuredData'),
    import('@/lib/structuredData'),
    import('@/lib/seo'),
  ]);

  const canonicalUrl = getCanonicalUrl('/courses');
  
  // Generate schemas in parallel
  const [organizationSchema, websiteSchema] = await getBaseSchemas();

  // ⚡ OPTIMIZATION: Don't fetch courses again - CourseGrid will fetch them client-side
  // This removes a blocking API call and speeds up initial render
  // Generate minimal CollectionPage schema without fetching courses
  const collectionPageSchema = generateCollectionPageSchema(canonicalUrl, {
    name: content.heading || 'All Courses',
    description: content.subheading || 'Browse all available courses at SkillVedika',
    items: [], // Empty items - CourseGrid will handle the actual course listing
  });

  return (
    <div className="bg-white py-10">
      {/* Structured Data for SEO */}
      <StructuredData data={[organizationSchema, websiteSchema, collectionPageSchema]} />
      {/* Preload LCP image for faster loading */}
      {firstCourseImage && <LCPPreload imageUrl={firstCourseImage} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADING - Render immediately for faster perceived performance */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            {status 
              ? `${status.charAt(0).toUpperCase() + status.slice(1)} Courses`
              : content.heading
            }
          </h1>
          <p className="text-gray-600 mt-2">
            {status 
              ? `Browse our ${status} courses designed to upgrade your skills`
              : content.subheading
            }
          </p>
        </div>

        {/* SEARCH BAR - Lazy loaded but with loading state */}
        <div className="flex justify-center mb-12">
          <CourseSearchBar />
        </div>

        {/* COURSES GRID - Lazy loaded with loading state */}
        <CourseGrid searchQuery={search} urlCategory={category} urlStatus={status} />
      </div>
    </div>
  );
}
