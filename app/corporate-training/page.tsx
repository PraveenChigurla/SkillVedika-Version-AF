import dynamicImport from 'next/dynamic';
import path from 'path';
import fs from 'fs';

// Lazy load components for better performance with loading states
// Hero is critical - load with SSR for faster initial render
const Hero = dynamicImport(() => import('@/components/corporate-training/hero'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />,
  ssr: true,
});

// Defer non-critical sections - dynamic imports still provide code splitting benefits
// Note: ssr: false is not allowed in Server Components, but code splitting still works
const EmpowerSection = dynamicImport(
  () => import('@/components/corporate-training/empower-section'),
  {
    loading: () => null,
  }
);

const TrainingPortfolio = dynamicImport(
  () => import('@/components/corporate-training/training-portfolio'),
  {
    loading: () => null,
  }
);

const Advantages = dynamicImport(() => import('@/components/corporate-training/advantages'), {
  loading: () => null,
});

const HrGuide = dynamicImport(() => import('@/components/corporate-training/hr-guide'), {
  loading: () => null,
});

const DemoSection = dynamicImport(() => import('@/components/corporate-training/demo-section'), {
  loading: () => null,
});

// Use auto-dynamic with revalidation for better performance
export const dynamic = 'auto';
export const revalidate = 300; // Revalidate every 5 minutes (corporate training changes less frequently)

/* ============================================================
   📌 DYNAMIC METADATA — Fetches from SEO database
   Compatible with Next.js 16 (params & props are Promises)
============================================================ */
export async function generateMetadata() {
  let apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const api = apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`;

  // Fetch metadata content from backend with caching
  let meta = null;
  try {
    const res = await fetch(`${api}/seo/3`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    if (res.ok) {
      const json = await res.json();
      meta = json.data ?? json;
    }
  } catch (err) {
    // Suppress connection errors during build (backend not available)
    const isConnectionError = err instanceof Error && 
      (err.message.includes('ECONNREFUSED') || 
       err.message.includes('fetch failed') ||
       (err as any)?.cause?.code === 'ECONNREFUSED');
    // Only log non-connection errors in development
    if (!isConnectionError && process.env.NODE_ENV === 'development') {
      console.error('❌ Metadata Fetch Error (Corporate):', err);
    }
  }

  // If API unavailable → fallback SEO
  if (!meta) {
    return {
      title: 'Corporate Training Programs for Teams | SkillVedika',
      description:
        "Upgrade your workforce with SkillVedika's customized corporate training programs designed to build leadership, technical, and soft skills.",
      keywords: [
        'corporate training',
        'employee upskilling',
        'leadership training',
        'technical training',
      ],
    };
  }

  // Build helpers that tolerate different shapes from the API
  const extractText = (value: any) => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) {
      const first = value[0];
      if (!first) return null;
      if (typeof first === 'string') return first;
      if (typeof first === 'object')
        return (
          first.text || first.title || Object.values(first).find(v => typeof v === 'string') || null
        );
    }
    if (typeof value === 'object') {
      return (
        value.text || value.title || Object.values(value).find(v => typeof v === 'string') || null
      );
    }
    return null;
  };

  // Prefer explicit SEO/meta fields, then fall back to hero fields
  const baseTitle =
    extractText(meta.meta_title) ||
    extractText(meta.seo_title) ||
    extractText(meta.hero_title) ||
    'Corporate Training';
  const title = `${baseTitle} `;
  const description =
    extractText(meta.meta_description) ||
    extractText(meta.seo_description) ||
    extractText(meta.hero_description) ||
    "Upgrade your workforce with SkillVedika's customized corporate training programs.";

  // Allow backend to provide keywords (string or array) via `meta.meta_keywords`, `meta.keywords` or `meta.seo_keywords`
  const rawKeywords = meta.meta_keywords || meta.keywords || meta.seo_keywords || null;
  const keywords = rawKeywords
    ? Array.isArray(rawKeywords)
      ? rawKeywords
      : String(rawKeywords)
          .split(',')
          .map((k: string) => k.trim())
          .filter(Boolean)
    : ['corporate training', 'employee upskilling', 'leadership training', 'technical training'];

  // Build image URL: prefer frontend public folder, then backend
  const imageRaw = meta.hero_image || meta.hero_banner || '/placeholder.svg';
  const imageClean = String(imageRaw ?? '/placeholder.svg')
    .replace(/\s+/g, '')
    .trim();
  let image: string;
  if (imageClean.startsWith('http')) {
    image = imageClean;
  } else {
    const publicFile = path.join(process.cwd(), 'public', imageClean.replace(/^\/+/, ''));
    if (fs.existsSync(publicFile)) {
      image = imageClean.startsWith('/') ? imageClean : `/${imageClean}`;
    } else {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const backendOrigin = apiBase.endsWith('/api') ? apiBase.replace(/\/api$/, '') : apiBase;
      image = imageClean.startsWith('/')
        ? `${backendOrigin}${imageClean}`
        : `${backendOrigin}/${imageClean}`;
    }
  }

  return {
    title,
    description,
    keywords,

    openGraph: {
      title,
      description,
      images: [image],
      type: 'website',
      url: 'https://skillvedika.com/corporate-training',
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },

    alternates: {
      canonical: (await import('@/lib/seo')).getCanonicalUrl('/corporate-training'),
    },
  };
}

/* ============================================================
   📌 PAGE COMPONENT
============================================================ */
export default async function CorporateTraining() {
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

  let content: any = null;
  let allCourses: any[] = [];
  let formDetails: any = null;

  /* --------------------------------------------------
        PARALLEL FETCHING FOR BETTER PERFORMANCE
  -------------------------------------------------- */
  const [contentRes, coursesRes, formDetailsRes] = await Promise.allSettled([
    // Main content - use revalidate for better caching
    fetch(`${api}/corporate-training`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    }),
    // Courses - cache for 24 hours
    fetch(`${api}/courses`, {
      next: { revalidate: 86400 },
    }),
    // Form details - cache for 1 hour
    fetch(`${api}/form-details`, {
      next: { revalidate: 3600 },
    }),
  ]);

  // Process content
  if (contentRes.status === 'fulfilled' && contentRes.value.ok) {
    try {
      const json = await contentRes.value.json();
      content = json.data ?? json;
    } catch (err) {
      console.error('❌ Error parsing corporate content:', err);
    }
  }

  // Process courses
  if (coursesRes.status === 'fulfilled' && coursesRes.value.ok) {
    try {
      const json = await coursesRes.value.json();
      allCourses = Array.isArray(json) ? json : json?.data || json?.courses || [];
      if (!Array.isArray(allCourses)) {
        allCourses = [];
      }
    } catch (err) {
      console.error('❌ Error parsing courses:', err);
    }
  }

  // Process form details
  if (formDetailsRes.status === 'fulfilled' && formDetailsRes.value.ok) {
    try {
      const json = await formDetailsRes.value.json();
      const payload = json.data ?? json;
      formDetails = Array.isArray(payload) ? payload[payload.length - 1] : payload;
    } catch (err) {
      console.error('❌ Error parsing form details:', err);
    }
  }

  /* --------------------------------------------------
        SAFETY FALLBACKS
  -------------------------------------------------- */
  if (!content) {
    return (
      <main className="min-h-screen flex items-center justify-center text-red-600 text-lg">
        Failed to load Corporate Training Page content.
      </main>
    );
  }

  const hero = content.hero_title ?? {
    part1: 'Skill Up with',
    highlight: 'SkillVedika',
  };

  const empower = content.empower_title ?? {
    part1: 'Empower Your',
    part2: 'Workforce',
  };

  /* --------------------------------------------------
        PAGE RENDER
  -------------------------------------------------- */
  // Map courses once for better performance
  const mappedCourses = allCourses.map((c: any) => ({
    id: c.id || c.course_id,
    title: c.title || c.course_name,
  }));

  /* --------------------------------------------------
        GENERATE STRUCTURED DATA
  -------------------------------------------------- */
  const { getBaseSchemas } = await import('@/lib/getBaseSchemas');
  const { generateWebPageSchema } = await import('@/lib/structuredData');
  const { StructuredData } = await import('@/lib/structuredData');
  const { getCanonicalUrl } = await import('@/lib/seo');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://skillvedika.com';
  const canonicalUrl = getCanonicalUrl('/corporate-training');
  const [organizationSchema, websiteSchema] = await getBaseSchemas();

  const webPageSchema = generateWebPageSchema(canonicalUrl, {
    name: 'Corporate Training | SkillVedika',
    description:
      content?.hero_subheading ||
      "Empower your workforce with SkillVedika's corporate training programs designed for businesses.",
    inLanguage: 'en-US',
    siteName: 'SkillVedika',
    siteUrl: siteUrl,
    organizationName: 'SkillVedika',
    organizationUrl: siteUrl,
  });

  return (
    <main className="min-h-screen bg-background overflow-x-hidden w-full max-w-full">
      {/* Structured Data for SEO */}
      <StructuredData data={[organizationSchema, websiteSchema, webPageSchema]} />

      {/* HERO SECTION */}
      <Hero
        titlePart1={hero.part1}
        titleHighlight={hero.highlight}
        subheading={content.hero_subheading}
        buttonText={content.hero_button_text}
        imagePath={content.hero_image}
        courses={mappedCourses}
      />

      {/* EMPOWER SECTION */}
      <EmpowerSection
        title={empower}
        description={content.empower_description}
        imagePath={content.empower_image}
      />

      {/* TRAINING PORTFOLIO */}
      <TrainingPortfolio
        title={content.portfolio_title}
        subtitle={content.portfolio_subtitle}
        items={content.portfolio_items}
      />

      {/* ADVANTAGES */}
      <Advantages
        title={content.advantages_title}
        subtitle={content.advantages_subtitle}
        leftItems={content.advantages_left_items}
        rightItems={content.advantages_right_items}
      />

      {/* HR GUIDE */}
      <HrGuide
        title={content.hr_guide_title}
        subtitle={content.hr_guide_subtitle}
        steps={content.hr_guide_steps}
      />

      {/* DEMO SECTION */}
      <DemoSection
        title={content.demo_title}
        points={(() => {
          // Normalize demo_points to always be an array of strings
          if (!content.demo_points) return [];
          if (Array.isArray(content.demo_points)) {
            // If it's an array, check if any element contains newlines
            return content.demo_points.flatMap((point: string) => {
              if (typeof point === 'string' && point.includes('\n')) {
                // Split by newlines and filter empty lines
                return point.split('\n').filter((line: string) => line.trim() !== '');
              }
              return point.trim() !== '' ? [point] : [];
            });
          }
          // If it's a string, split by newlines
          if (typeof content.demo_points === 'string') {
            return content.demo_points.split('\n').filter((line: string) => line.trim() !== '');
          }
          return [];
        })()}
        allCourses={allCourses}
        formDetails={formDetails}
      />

      {/* FAQ (optional) */}
      {/* <FAQ /> */}
    </main>
  );
}
