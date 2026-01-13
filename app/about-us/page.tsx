import AboutSection from '@/components/about-us/about-section';
import DemoSection from '@/components/about-us/demo-section';
import { Metadata } from 'next';
import { StructuredData, generateAboutPageSchema } from '@/lib/structuredData';
import { getBaseSchemas } from '@/lib/getBaseSchemas';
import { getCanonicalUrl } from '@/lib/seo';

// Force dynamic rendering to fetch metadata from database at request time
export const dynamic = 'force-dynamic';

/* ----------------------------------------
      GENERATE DYNAMIC META TAGS FOR SEO
---------------------------------------- */
export async function generateMetadata(): Promise<Metadata> {
  const api = process.env.NEXT_PUBLIC_API_URL;

  const fallbackTitle = 'About Us | SkillVedika – Leading Online Training & Career Development';
  const fallbackDescription =
    'SkillVedika is a leading online training institute offering expert-led IT courses, corporate training, job support and hands-on sessions designed to help learners grow in their careers.';
  const fallbackKeywords = [
    'SkillVedika',
    'About SkillVedika',
    'Online training institute',
    'IT courses online',
    'Corporate training',
    'Job support services',
    'Professional upskilling',
    'Career development programs',
    'Software training institute',
  ];

  try {
    // Fetch SEO metadata for the About page from the `seos` table.
    // We fetch the specific row by primary key (id = 5) which corresponds
    // to the About page in the seed data. This keeps content and SEO
    // separate (admins can manage SEO independently).
    const res = await fetch(`${api}/seo?slug=about-us`, { cache: 'no-store' });
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
      const canonicalUrl = getCanonicalUrl('/about-us');

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
    console.error('Error fetching metadata for About page:', err);
  }

  // Fallback metadata
  return {
    title: fallbackTitle,
    description: fallbackDescription,
    keywords: fallbackKeywords,
  };
}

// Helper function to process API response
async function processApiResponse<T>(
  result: PromiseSettledResult<Response>,
  parser: (json: any) => T,
  fallback: T
): Promise<T> {
  if (result.status === 'fulfilled' && result.value.ok) {
    try {
      const json = await result.value.json();
      return parser(json);
    } catch {
      // Silently fail - return fallback
    }
  }
  return fallback;
}

// Helper to parse courses from API response
function parseCourses(json: any): any[] {
  const courses = Array.isArray(json) ? json : json?.data || json?.courses || [];
  return Array.isArray(courses) ? courses : [];
}

// Helper to parse form details from API response
function parseFormDetails(json: any): any {
  const payload = json.data ?? json;
  if (Array.isArray(payload)) {
    return payload.length > 0 ? payload.at(-1) ?? null : null;
  }
  return payload;
}

// Helper to build sameAs array from social links
function buildSameAsArray(socialLinks: any): string[] {
  const sameAs: string[] = [];
  const socialKeys = ['instagram', 'twitter', 'youtube', 'facebook'] as const;
  
  for (const key of socialKeys) {
    const link = socialLinks?.[key];
    if (link && !link.startsWith('#')) {
      sameAs.push(link);
    }
  }
  
  return sameAs;
}

export default async function AboutPage() {
  const api = process.env.NEXT_PUBLIC_API_URL;

  // ⚡ OPTIMIZATION: Fetch all data in parallel for better performance
  const [contentRes, coursesRes, formDetailsRes] = await Promise.allSettled([
    fetch(`${api}/about-page`, { cache: 'no-store' }),
    fetch(`${api}/courses`, { next: { revalidate: 86400 } }),
    fetch(`${api}/form-details`, { cache: 'no-store' }),
  ]);

  // Process all responses using helper functions
  const content = await processApiResponse(
    contentRes,
    (json) => json.data || json,
    null
  );

  const allCourses = await processApiResponse(
    coursesRes,
    parseCourses,
    []
  );

  const formDetails = await processApiResponse(
    formDetailsRes,
    parseFormDetails,
    null
  );

  /* -------------------------------
        ERROR HANDLING
  ------------------------------- */
  if (!content) {
    return (
      <main className="min-h-screen flex items-center justify-center text-red-600 text-center">
        Failed to load About Us page content.
      </main>
    );
  }

  /* -------------------------------
        GENERATE STRUCTURED DATA
  ------------------------------- */
  const canonicalUrl = getCanonicalUrl('/about-us');

  // Fetch footer settings for organization data
  let footerSettings: any = null;
  try {
    const footerRes = await fetch(`${api}/footer-settings`, {
      cache: 'force-cache',
      next: { revalidate: 3600 },
    });
    if (footerRes.ok) {
      footerSettings = await footerRes.json();
    }
  } catch {
    // Silently fail - use defaults (intentional for graceful degradation)
  }

  const contactDetails = footerSettings?.contact_details || {};
  const socialLinks = footerSettings?.social_links || {};
  const sameAs = buildSameAsArray(socialLinks);

  // Generate base schemas (Organization + WebSite)
  const [organizationSchema, websiteSchema] = await getBaseSchemas({
    description: footerSettings?.about || content?.aboutus_description,
    email: contactDetails?.email,
    phone: contactDetails?.phone,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  });

  // Generate AboutPage schema
  const baseUrl = canonicalUrl.split('/about-us')[0] || canonicalUrl.replace('/about-us', '');
  const aboutPageSchema = generateAboutPageSchema(canonicalUrl, {
    name: 'SkillVedika',
    url: baseUrl,
    logo: `${baseUrl}/skillvedika-logo.png`,
    description:
      footerSettings?.about ||
      content?.aboutus_description ||
      'SkillVedika is a leading online training institute offering expert-led IT courses, corporate training, job support and hands-on sessions designed to help learners grow in their careers.',
    email: contactDetails?.email,
    phone: contactDetails?.phone,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  });

  /* -------------------------------
        PAGE RENDER
  ------------------------------- */
  return (
    <main className="bg-white">
      {/* Structured Data for SEO */}
      <StructuredData data={[organizationSchema, websiteSchema, aboutPageSchema]} />

      <AboutSection
        image={content.aboutus_image}
        title={content.aboutus_title}
        description={content.aboutus_description}
      />

      <DemoSection
        allCourses={allCourses}
        title={content.demo_title}
        points={content.demo_content}
        formDetails={formDetails}
      />
    </main>
  );
}
