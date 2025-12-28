import dynamicImport from 'next/dynamic';
import type { HeroSectionProps } from '@/components/on-job-support/hero-section';
import type { ReadyToEmpowerProps } from '@/components/on-job-support/ready-to-empower';

// Lazy load components for better performance
const HeroSection = dynamicImport<HeroSectionProps>(
  () => import('@/components/on-job-support/hero-section'),
  { ssr: true }
);
const RealTimeHelp = dynamicImport(() => import('@/components/on-job-support/real-time-help'));
const WhoIsThisFor = dynamicImport(() => import('@/components/on-job-support/who-is-this-for'));
const HowWeHelp = dynamicImport(() => import('@/components/on-job-support/how-we-help'));
const OurProcess = dynamicImport(() => import('@/components/on-job-support/our-process'));
const WhyChoose = dynamicImport(() => import('@/components/on-job-support/why-choose'));
const ReadyToEmpower = dynamicImport<ReadyToEmpowerProps>(() => import('@/components/on-job-support/ready-to-empower'));
const GetLiveDemo = dynamicImport(() => import('@/components/on-job-support/get-live-demo'));

// Force dynamic rendering to fetch metadata from database at request time
export const dynamic = 'force-dynamic';

/* ============================================================
   ⭐ 1. Dynamic Metadata for On-Job-Support Page
   Compatible with Next.js 16 (params & props are Promises)
============================================================ */
export async function generateMetadata() {
  // Use getApiUrl helper for consistent URL construction
  const { getApiUrl } = await import('@/lib/apiConfig');

  const fallbackTitle = 'On-Job Support | SkillVedika';
  const fallbackDescription = "Get real-time expert help, hands-on technical support, and job-ready guidance with SkillVedika's On-Job Support.";
  const fallbackKeywords = [
    'on job support',
    'skillvedika support',
    'real time project help',
    'technical support',
  ];

  try {
    // Fetch SEO metadata for the On-Job Support page from the `seos` table.
    // We fetch the specific row by primary key (id = 4) which corresponds
    // to the On-Job Support page in the seed data.
    const res = await fetch(getApiUrl('/seo/4'), { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      const content = json.data || json;

      let keywords: string[];
      if (content.meta_keywords) {
        if (typeof content.meta_keywords === 'string') {
          keywords = content.meta_keywords.split(',').map((k: string) => k.trim());
        } else {
          keywords = content.meta_keywords;
        }
      } else {
        keywords = fallbackKeywords;
      }

      const { getCanonicalUrl } = await import('@/lib/seo');
      const canonicalUrl = getCanonicalUrl('/on-job-support');

      return {
        title: content.meta_title || fallbackTitle,
        description: content.meta_description || fallbackDescription,
        keywords,
        alternates: {
          canonical: canonicalUrl,
        },
        openGraph: {
          title: content.meta_title || fallbackTitle,
          description: content.meta_description || fallbackDescription,
          url: canonicalUrl,
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: content.meta_title || fallbackTitle,
          description: content.meta_description || fallbackDescription,
        },
      };
    }
  } catch (err) {
    console.error('Error fetching metadata for On-Job Support page:', err);
  }

  // Fallback metadata
  const { getCanonicalUrl } = await import('@/lib/seo');
  const canonicalUrl = getCanonicalUrl('/on-job-support');

  return {
    title: fallbackTitle,
    description: fallbackDescription,
    keywords: fallbackKeywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fallbackTitle,
      description: fallbackDescription,
      url: canonicalUrl,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fallbackTitle,
      description: fallbackDescription,
    },
  };
}

/* ============================================================
   ⭐ 2. PAGE COMPONENT — Your Original Logic (unchanged)
============================================================ */
// Helper to process API response
async function processApiResponseForOJS<T>(
  result: PromiseSettledResult<Response>,
  parser: (json: any) => T,
  fallback: T
): Promise<T> {
  if (result.status === 'fulfilled' && result.value.ok) {
    try {
      const json = await result.value.json();
      return parser(json);
    } catch {
      // Silently fail
    }
  }
  return fallback;
}

// Helper to parse courses
function parseCoursesForOJS(json: any): any[] {
  const courses = Array.isArray(json) ? json : json?.data || json?.courses || [];
  return Array.isArray(courses) ? courses : [];
}

// Helper to parse form details
function parseFormDetailsForOJS(json: any): any {
  const payload = json.data ?? json;
  return Array.isArray(payload) ? (payload.at(-1) ?? null) : payload;
}

export default async function OnJobSupport() {
  // Use getApiUrl helper for consistent URL construction
  const { getApiUrl } = await import('@/lib/apiConfig');
  
  // ⚡ OPTIMIZATION: Fetch all data in parallel for better performance
  const [contentRes, coursesRes, formDetailsRes] = await Promise.allSettled([
    fetch(getApiUrl('/on-job-support-page'), { cache: 'no-store' }),
    fetch(getApiUrl('/courses'), { next: { revalidate: 86400 } }),
    fetch(getApiUrl('/form-details'), { cache: 'no-store' }),
  ]);

  // Process all responses using helper functions
  const content = await processApiResponseForOJS(
    contentRes,
    (json) => json.data || json,
    null
  );

  const allCourses = await processApiResponseForOJS(
    coursesRes,
    parseCoursesForOJS,
    []
  );

  const formDetails = await processApiResponseForOJS(
    formDetailsRes,
    parseFormDetailsForOJS,
    null
  );

  if (!content) {
    return (
      <main className="min-h-screen flex items-center justify-center text-red-600">
        Failed to load On-Job-Support content.
      </main>
    );
  }

  /* -------------------------------
        GENERATE STRUCTURED DATA
  ------------------------------- */
  const { getBaseSchemas } = await import('@/lib/getBaseSchemas');
  const { generateWebPageSchema } = await import('@/lib/structuredData');
  const { StructuredData } = await import('@/lib/structuredData');
  const { getCanonicalUrl } = await import('@/lib/seo');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://skillvedika.com';
  const canonicalUrl = getCanonicalUrl('/on-job-support');
  const [organizationSchema, websiteSchema] = await getBaseSchemas();

  const webPageSchema = generateWebPageSchema(canonicalUrl, {
    name: 'On-Job Support | SkillVedika',
    description:
      content?.hero_description ||
      "Get real-time support and guidance for your job with SkillVedika's on-job support services.",
    inLanguage: 'en-US',
    siteName: 'SkillVedika',
    siteUrl: siteUrl,
    organizationName: 'SkillVedika',
    organizationUrl: siteUrl,
  });

  return (
    <main className="min-h-screen bg-white">
      {/* Structured Data for SEO */}
      <StructuredData data={[organizationSchema, websiteSchema, webPageSchema]} />

      <HeroSection
        title={content.hero_title}
        description={content.hero_description}
        buttonText={content.hero_button_text}
        imagePath={content.hero_image}
      />

      <RealTimeHelp
        title={content.realtime_title}
        subheading={content.realtime_subheading}
        description={content.realtime_description}
        subsection1Title={content.realtime_subsection_title1}
        subsection1Desc={content.subsection_title1_description}
        subsection2Title={content.realtime_subsection_title2}
        subsection2Desc={content.subsection_title2_description}
        imagePath={content.realtime_image}
      />

      <WhoIsThisFor
        targetLabel={content.who_target}
        title={content.who_title}
        subtitle={content.who_subtitle}
        cards={content.who_cards}
      />

      <HowWeHelp
        title={content.how_title}
        subtitle={content.how_subtitle}
        points={content.how_points}
        footer={content.how_footer}
      />

      <OurProcess
        title={content.process_title}
        subtitle={content.process_subtitle}
        steps={
          Array.isArray(content.process_points)
            ? content.process_points.map((step: any, index: number) => ({
                number: index + 1,
                title: step.label || step.title || '',
                description: step.description || '',
              }))
            : []
        }
      />

      <WhyChoose
        title={content.why_title}
        points={(() => {
          // Normalize why_points to always be an array of strings
          if (!content.why_points) return [];
          if (Array.isArray(content.why_points)) {
            return content.why_points.filter((point: any) => {
              if (typeof point === 'string') return point.trim() !== '';
              return false;
            });
          }
          // If it's a string, try to split it
          if (typeof content.why_points === 'string') {
            // Try to parse as JSON array first
            try {
              const parsed = JSON.parse(content.why_points);
              if (Array.isArray(parsed)) {
                return parsed.filter((p: any) => typeof p === 'string' && p.trim() !== '');
              }
            } catch {
              // Not JSON, treat as single string
            }
            // Split by commas if it's a comma-separated string
            if (content.why_points.includes(',')) {
              return content.why_points
                .split(',')
                .map((p: string) => p.trim().replaceAll(/(^["']|["']$)/g, ''))
                .filter((p: string) => p !== '');
            }
            // Single string
            if (content.why_points.trim() !== '') {
              return [content.why_points];
            }
            return [];
          }
          return [];
        })()}
        image={content.why_image}
      />

      <ReadyToEmpower
        title={content.ready_title}
        description={content.ready_description}
        buttonText={content.ready_button}
        buttonLink={content.ready_button_link}
        image={content.ready_image}
      />

      <GetLiveDemo
        allCourses={allCourses}
        target={content.demo_target}
        title={content.demo_title}
        subtitle={content.demo_subtitle}
        points={content.demo_points}
        formDetails={formDetails}
      />
    </main>
  );
}
