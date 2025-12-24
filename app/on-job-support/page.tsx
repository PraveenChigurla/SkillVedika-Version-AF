import dynamicImport from 'next/dynamic';
import path from 'node:path';
import fs from 'node:fs';

// Lazy load components for better performance
const HeroSection = dynamicImport(() => import('@/components/on-job-support/hero-section'));
const RealTimeHelp = dynamicImport(() => import('@/components/on-job-support/real-time-help'));
const WhoIsThisFor = dynamicImport(() => import('@/components/on-job-support/who-is-this-for'));
const HowWeHelp = dynamicImport(() => import('@/components/on-job-support/how-we-help'));
const OurProcess = dynamicImport(() => import('@/components/on-job-support/our-process'));
const WhyChoose = dynamicImport(() => import('@/components/on-job-support/why-choose'));
const ReadyToEmpower = dynamicImport(() => import('@/components/on-job-support/ready-to-empower'));
const GetLiveDemo = dynamicImport(() => import('@/components/on-job-support/get-live-demo'));

export const dynamic = 'force-dynamic';

// Helper to extract text from various API response shapes
function extractText(value: any): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  
  if (Array.isArray(value)) {
    const first = value[0];
    if (!first) return null;
    if (typeof first === 'string') return first;
    if (typeof first === 'object') {
      return first.text || first.title || Object.values(first).find(v => typeof v === 'string') || null;
    }
  }
  
  if (typeof value === 'object') {
    return value.text || value.title || Object.values(value).find(v => typeof v === 'string') || null;
  }
  
  return null;
}

// Helper to process image URL
function processImageUrlForOJS(imageRaw: string, apiBase: string): string {
  const imageClean = String(imageRaw ?? '/placeholder.svg')
    .replaceAll(/\s+/g, '')
    .trim();
  
  if (imageClean.startsWith('http')) {
    return imageClean;
  }
  
  const publicFile = path.join(process.cwd(), 'public', imageClean.replace(/^\/+/, ''));
  if (fs.existsSync(publicFile)) {
    return imageClean.startsWith('/') ? imageClean : `/${imageClean}`;
  }
  
  const backendOrigin = apiBase.endsWith('/api') ? apiBase.replace(/\/api$/, '') : apiBase;
  return imageClean.startsWith('/')
    ? `${backendOrigin}${imageClean}`
    : `${backendOrigin}/${imageClean}`;
}

/* ============================================================
   ⭐ 1. Dynamic Metadata for On-Job-Support Page
   Compatible with Next.js 16 (params & props are Promises)
============================================================ */
export async function generateMetadata() {
  let apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const api = apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`;

  // Fetch metadata content from backend
  let meta = null;
  try {
    const res = await fetch(`${api}/seo/4`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      meta = json.data ?? json;
    }
  } catch (err) {
    console.error('❌ Metadata Fetch Error (OJS):', err);
  }

  // If API unavailable → fallback SEO
  if (!meta) {
    return {
      title: 'On-Job Support | SkillVedikaAA',
      description:
        "Get real-time expert help, hands-on technical support, and job-ready guidance with SkillVedika's On-Job Support.",
      keywords: [
        'on job support',
        'skillvedika support',
        'real time project help',
        'technical support',
      ],
    };
  }

  // Prefer explicit SEO/meta fields, then fall back to hero fields
  const baseTitle =
    extractText(meta.meta_title) ||
    extractText(meta.seo_title) ||
    extractText(meta.hero_title) ||
    'On-Job Support';
  const title = `${baseTitle} `;
  const description =
    extractText(meta.meta_description) ||
    extractText(meta.seo_description) ||
    extractText(meta.hero_description) ||
    'Get hands-on technical guidance, real-time issue resolution, and expert-driven On-Job Support at SkillVedika.';

  // Allow backend to provide keywords (string or array) via `meta.meta_keywords`, `meta.keywords` or `meta.seo_keywords`
  const rawKeywords = meta.meta_keywords || meta.keywords || meta.seo_keywords || null;
  let keywords: string[];
  if (rawKeywords) {
    if (Array.isArray(rawKeywords)) {
      keywords = rawKeywords;
    } else {
      keywords = String(rawKeywords)
        .split(',')
        .map((k: string) => k.trim())
        .filter(Boolean);
    }
  } else {
    keywords = ['on job support', 'real time support', 'project support', 'technical help', 'skillvedika'];
  }

  // Build image URL: prefer frontend public folder, then backend
  const imageRaw = meta.hero_image || meta.hero_banner || '/placeholder.svg';
  const image = processImageUrlForOJS(imageRaw, apiBase);

  return {
    title,
    description,
    keywords,

    openGraph: {
      title,
      description,
      images: [image],
      type: 'website',
      url: 'https://skillvedika.com/on-job-support',
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },

    alternates: {
      canonical: (await import('@/lib/seo')).getCanonicalUrl('/on-job-support'),
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
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  // ⚡ OPTIMIZATION: Fetch all data in parallel for better performance
  const [contentRes, coursesRes, formDetailsRes] = await Promise.allSettled([
    fetch(`${api}/on-job-support-page`, { cache: 'no-store' }),
    fetch(`${api}/courses`, { next: { revalidate: 86400 } }),
    fetch(`${api}/form-details`, { cache: 'no-store' }),
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
        buttonLink={content.hero_button_link}
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
