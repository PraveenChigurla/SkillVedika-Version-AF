import { Metadata } from 'next';
import dynamicImport from 'next/dynamic';
import { getCanonicalUrl } from '@/lib/seo';

// Use auto-dynamic with revalidation for better performance
export const dynamic = 'auto';
export const revalidate = 300; // Revalidate every 5 minutes (course details change less frequently)

// Lazy load components for better performance - defer non-critical ones
const Hero = dynamicImport(() => import('@/components/course-details/hero'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />,
});

// Defer these components until after initial render
const TrainingAgenda = dynamicImport(() => import('@/components/course-details/training-agenda'));
const WhyChoose = dynamicImport(() => import('@/components/course-details/why-choose'));
const WhoShouldJoin = dynamicImport(() => import('@/components/course-details/who-should-join'));
const KeyOutcomes = dynamicImport(() => import('@/components/course-details/key-outcomes'));
const JobAssistance = dynamicImport(() => import('@/components/course-details/job-assistance'));
const Faq = dynamicImport(() => import('@/components/course-details/faq'));
const Placement = dynamicImport(() => import('@/components/course-details/placement'));
const Reserve = dynamicImport(() => import('@/components/course-details/reserve'));

// Generate metadata for SEO
export async function generateMetadata(props: any): Promise<Metadata> {
  const propsResolved = await props;
  const paramsResolved = await propsResolved.params;
  const identifier = Array.isArray(paramsResolved?.id) ? paramsResolved.id[0] : paramsResolved?.id;

  if (!identifier) {
    return {
      title: 'Course Details | SkillVedika',
      description:
        "Learn industry-ready skills with SkillVedika's comprehensive training programs.",
    };
  }

  // Use getApiUrl helper for consistent URL construction
  const { getApiUrl } = await import('@/lib/apiConfig');

  try {
    // Try course-details endpoint first (supports both slug and ID)
    let res = await fetch(getApiUrl(`/course-details/${identifier}`), {
      cache: 'force-cache',
      next: { revalidate: 300 },
    });

    // Fallback to courses endpoint for backward compatibility
    if (!res.ok && !Number.isNaN(Number(identifier))) {
      res = await fetch(getApiUrl(`/courses/${identifier}`), {
        cache: 'force-cache',
        next: { revalidate: 300 },
      });
    }

    if (res.ok) {
      const json = await res.json();
      const courseData = json.course || json.data || json;
      const details = courseData?.details || {};

      const title = details.meta_title || courseData.title || 'Course Details';
      const description =
        details.meta_description ||
        courseData.description ||
        `Learn ${courseData.title} with SkillVedika. Industry-ready training designed to boost your career.`;

      const canonicalUrl = getCanonicalUrl(`/course-details/${identifier}`);

      return {
        title: `${title} | SkillVedika`,
        description,
        keywords: details.meta_keywords,
        alternates: {
          canonical: canonicalUrl,
        },
        openGraph: {
          title,
          description,
          type: 'website',
          url: canonicalUrl,
        },
      };
    }
  } catch {
    // Fallback metadata - intentional silent failure for graceful degradation
  }

  return {
    title: 'Course Details | SkillVedika',
    description: "Learn industry-ready skills with SkillVedika's comprehensive training programs.",
  };
}

export default async function CourseDetailsPage(props: any) {
  try {
    // Next.js 16: resolve props and params which may be promises
    const propsResolved = await props;
    const paramsResolved = await propsResolved.params;
    const searchParamsResolved = propsResolved.searchParams
      ? await propsResolved.searchParams
      : null;

    const identifier = Array.isArray(paramsResolved?.id)
      ? paramsResolved.id[0]
      : paramsResolved?.id;
    const identifierString = String(identifier || '');

    // Parse formDetails from search params
    let formDetails = null;
    if (searchParamsResolved) {
      try {
        const formDetailsParam =
          searchParamsResolved?.formDetails || searchParamsResolved?.get?.('formDetails');
        if (formDetailsParam) {
          formDetails = JSON.parse(decodeURIComponent(String(formDetailsParam)));
        }
      } catch {
        // Silently fail - formDetails will remain null
      }
    }

    // Show error if identifier is missing
    if (!identifierString) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Course</h1>
            <p className="text-gray-600 mb-8">The course identifier is missing or invalid.</p>
            <a href="/courses" className="text-blue-600 hover:underline">
              Back to Courses
            </a>
          </div>
        </div>
      );
    }

// Helper to normalize course details
function normalizeCourseDetails(detailsData: any) {
  if (!detailsData) {
    return {
      agenda: [],
      why_choose: [],
      who_should_join: [],
      key_outcomes: [],
      meta_title: null,
      meta_description: null,
      meta_keywords: null,
    };
  }

  return {
    agenda: detailsData.agenda || [],
    why_choose: detailsData.why_choose || [],
    who_should_join: detailsData.who_should_join || [],
    key_outcomes: detailsData.key_outcomes || [],
    meta_title: detailsData.meta_title || null,
    meta_description: detailsData.meta_description || null,
    meta_keywords: detailsData.meta_keywords || null,
    ...detailsData,
  };
}

// Helper to fetch course by identifier
async function fetchCourseByIdentifier(api: string, identifierString: string): Promise<any> {
  try {
    // Try course-details endpoint first (supports slugs)
    let courseRes = await fetch(`${api}/course-details/${identifierString}`, {
      cache: 'force-cache',
      next: { revalidate: 300 },
      headers: {
        'Accept': 'application/json',
      },
    });

    // Fallback to courses endpoint if needed (for numeric IDs)
    if (!courseRes.ok && !Number.isNaN(Number(identifierString))) {
      courseRes = await fetch(`${api}/courses/${identifierString}`, {
        cache: 'force-cache',
        next: { revalidate: 300 },
        headers: {
          'Accept': 'application/json',
        },
      });
    }

    if (!courseRes.ok) {
      console.warn(`Course not found: ${identifierString} (Status: ${courseRes.status})`);
      return null;
    }

    const json = await courseRes.json();
    let courseData = json.data || json.course || json;
    let detailsData = courseData?.details || null;

    // If we got details directly, fetch the course
    if (courseData && !courseData.title && courseData.course_id) {
      const courseFetch = await fetch(`${api}/courses/${courseData.course_id}`, {
        cache: 'force-cache',
        next: { revalidate: 300 },
        headers: {
          'Accept': 'application/json',
        },
      });
      if (courseFetch.ok) {
        const courseJson = await courseFetch.json();
        courseData = courseJson.course || courseJson.data || courseJson;
        detailsData = courseData?.details || courseData;
      }
    }

    return {
      ...courseData,
      details: normalizeCourseDetails(detailsData),
    };
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
}

// Helper to fetch all courses
async function fetchAllCourses(api: string): Promise<any[]> {
  try {
    const coursesRes = await fetch(`${api}/courses`, {
      cache: 'force-cache',
      next: { revalidate: 300 },
    });
    if (coursesRes.ok) {
      const allJson = await coursesRes.json();
      return Array.isArray(allJson) ? allJson : allJson.data || [];
    }
  } catch {
    // Silently fail
  }
  return [];
}

    // Fetch course data on server - use getApiUrl helper
    const { getApiBaseUrl } = await import('@/lib/apiConfig');
    const api = getApiBaseUrl();

    let course: any = null;
    let allCourses: any[] = [];

    try {
      // Fetch course and all courses in parallel for better performance
      const [courseResult, allCoursesResult] = await Promise.allSettled([
        fetchCourseByIdentifier(api, identifierString),
        fetchAllCourses(api),
      ]);

      course = courseResult.status === 'fulfilled' ? courseResult.value : null;
      allCourses = allCoursesResult.status === 'fulfilled' ? allCoursesResult.value : [];
    } catch (error) {
      // Log error but don't throw - we'll show a user-friendly error page
      console.error('Error loading course data:', error);
      course = null;
      allCourses = [];
    }

    if (!course) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
            <p className="text-gray-600 mb-2">
              The course with ID "{identifierString}" could not be loaded.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Please check if the course exists and try again.
            </p>
            <a href="/courses" className="text-blue-600 hover:underline">
              Back to Courses
            </a>
          </div>
        </div>
      );
    }

    // Ensure course has required structure
    if (!course?.id) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
            <p className="text-gray-600 mb-2">
              The course with ID "{identifierString}" could not be loaded.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Please check if the course exists and try again.
            </p>
            <a href="/courses" className="text-blue-600 hover:underline">
              Back to Courses
            </a>
          </div>
        </div>
      );
    }

    // Ensure details exist with fallback
    const courseDetails = course.details || {
      agenda: [],
      why_choose: [],
      who_should_join: [],
      key_outcomes: [],
    };

    // Ensure allCourses is an array
    const safeAllCourses = Array.isArray(allCourses) ? allCourses : [];

    /* ----------------------------------------------------
       GENERATE STRUCTURED DATA
    ---------------------------------------------------- */
    const { getBaseSchemas } = await import('@/lib/getBaseSchemas');
    const { generateCourseSchema, generateFAQPageSchema } = await import('@/lib/structuredData');
    const { StructuredData } = await import('@/lib/structuredData');

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://skillvedika.com';
    const canonicalUrl = getCanonicalUrl(`/course-details/${identifierString}`);
    const [organizationSchema, websiteSchema] = await getBaseSchemas();

    // Generate Course schema
    const courseSchema = generateCourseSchema(
      course.title || 'Course',
      courseDetails.meta_description ||
        course.description ||
        course.subtitle ||
        'Professional training course',
      'SkillVedika',
      siteUrl,
      course.image || course.banner_image || `${siteUrl}/skillvedika-logo.png`,
      canonicalUrl
    );

    // Fetch FAQs for FAQPage schema (server-side)
    let faqs: Array<{ question: string; answer: string }> = [];
    try {
      // Use getApiUrl helper for consistent URL construction
      const { getApiUrl } = await import('@/lib/apiConfig');
      const faqsUrl = getApiUrl('/faqs');
      
      const faqsRes = await fetch(faqsUrl, {
        cache: 'force-cache',
        next: { revalidate: 3600 },
        headers: {
          'Accept': 'application/json',
        },
      });
      if (faqsRes.ok) {
        const faqsData = await faqsRes.json();
        let faqsArray: any[] = [];

        if (Array.isArray(faqsData)) {
          faqsArray = faqsData;
        } else if (faqsData?.faqs && Array.isArray(faqsData.faqs)) {
          faqsArray = faqsData.faqs;
        } else if (faqsData?.data && Array.isArray(faqsData.data)) {
          faqsArray = faqsData.data;
        }

        // Filter visible FAQs and map to schema format
        const visibleFaqs = faqsArray.filter((f: any) => {
          const raw = f?.show;
          if (raw === undefined || raw === null) return true;
          if (typeof raw === 'boolean') return raw === true;
          if (typeof raw === 'number') return raw === 1;
          const s = String(raw).trim().toLowerCase();
          return s === 'y' || s === 'yes' || s === '1' || s === 'true';
        });

        faqs = visibleFaqs
          .map((f: any) => ({
            question: f.question || '',
            answer: f.answer || '',
          }))
          .filter((f: any) => f.question && f.answer);
      }
    } catch {
      // Silently fail - FAQs are optional (intentional for graceful degradation)
    }

    // Generate FAQPage schema if FAQs are available
    const faqPageSchema = generateFAQPageSchema(faqs);

    // Combine schemas - StructuredData accepts object | object[]
    const schemas: object[] = [organizationSchema, websiteSchema, courseSchema];
    if (faqPageSchema) {
      schemas.push(faqPageSchema);
    }

    return (
      <main className="w-full">
        {/* Structured Data for SEO */}
        <StructuredData data={schemas} />

        <Hero course={course} allCourses={safeAllCourses} formDetails={formDetails} />
        <TrainingAgenda agenda={courseDetails.agenda || []} />
        <WhyChoose list={courseDetails.why_choose || []} />
        <WhoShouldJoin list={courseDetails.who_should_join || []} />
        <KeyOutcomes list={courseDetails.key_outcomes || []} />
        <JobAssistance />
        <Faq />
        <Placement />
        <Reserve agenda={courseDetails.agenda || []} />
      </main>
    );
  } catch {
    // Catch any errors in the component - intentional for graceful degradation
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Page</h1>
          <p className="text-gray-600 mb-8">An error occurred while loading the course details.</p>
          <a href="/courses" className="text-blue-600 hover:underline">
            Back to Courses
          </a>
        </div>
      </div>
    );
  }
}
