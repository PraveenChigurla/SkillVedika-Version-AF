import { Metadata } from 'next';
import SafeHTML from '@/components/SafeHTML';

// Force dynamic rendering to fetch metadata from database at request time
export const dynamic = 'force-dynamic';

/* ------------------------------------------------------------------
      DYNAMIC SEO META TAGS FOR INSTRUCTOR TERMS & CONDITIONS PAGE
   Fetches SEO metadata from the `seos` table
------------------------------------------------------------------ */
export async function generateMetadata(): Promise<Metadata> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fallbackTitle = 'Instructor Terms & Conditions - SkillVedika';
  const fallbackDescription =
    "Read SkillVedika's terms and conditions for instructors, including compensation, course creation guidelines, and instructor responsibilities.";
  const fallbackKeywords = [
    'instructor terms',
    'instructor agreement',
    'teaching terms',
    'skillvedika instructor',
    'instructor policy',
  ];

  try {
    // Fetch SEO metadata for the Instructor Terms page from the `seos` table.
    // id = 21 corresponds to "Terms & Conditions (Instructor)" in the seed data.
    const res = await fetch(`${apiUrl}/seo?slug=terms-and-conditions-instructor`, {
      cache: 'no-store',
    });

    let content = null;
    if (res.ok) {
      const json = await res.json();
      content = json?.data ?? json ?? null;
    } else {
      console.warn(`SEO entry 21 not found, using fallback metadata for instructor terms`);
    }

    const { getCanonicalUrl } = await import('@/lib/seo');
    const canonicalUrl = getCanonicalUrl('/terms-and-conditions/instructor');

    if (!content) {
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

    const keywords = content.meta_keywords
      ? typeof content.meta_keywords === 'string'
        ? content.meta_keywords.split(',').map((k: string) => k.trim())
        : content.meta_keywords
      : fallbackKeywords;

    const metaTitle = content.meta_title ?? fallbackTitle;
    const metaDescription = content.meta_description ?? fallbackDescription;

    return {
      title: metaTitle,
      description: metaDescription,
      keywords,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: canonicalUrl,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: metaTitle,
        description: metaDescription,
      },
    };
  } catch (err) {
    console.error('Error generating instructor terms metadata:', err);
    const { getCanonicalUrl } = await import('@/lib/seo');
    const canonicalUrl = getCanonicalUrl('/terms-and-conditions/instructor');

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
}

async function getInstructorTerms() {
  try {
    // Fetch data from Laravel API (dynamic, no caching)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      console.warn('NEXT_PUBLIC_API_URL not configured');
      return null;
    }

    // Fetch instructor-specific terms
    console.log(`Fetching from: ${apiUrl}/terms-and-conditions?type=instructor`);
    const res = await fetch(`${apiUrl}/terms-and-conditions?type=instructor`, {
      cache: 'no-store',
    });

    console.log(`Response status: ${res.status}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.warn(`Failed to fetch instructor terms: ${res.status}`, errorText.substring(0, 200));
      return null;
    }

    const response = await res.json();
    console.log('Instructor terms data fetched successfully:', response);

    // Extract data from response - backend returns {success: true, data: {...}}
    const termsData = response?.data ?? response;
    return termsData;
  } catch (err) {
    console.warn('Error fetching instructor terms:', err);
    return null;
  }
}

export default async function InstructorTermsPage() {
  const terms = await getInstructorTerms();

  /* ----------------------------------------------------
     GENERATE STRUCTURED DATA
  ---------------------------------------------------- */
  const { getBaseSchemas } = await import('@/lib/getBaseSchemas');
  const { generateWebPageSchema } = await import('@/lib/structuredData');
  const { StructuredData } = await import('@/lib/structuredData');
  const { getCanonicalUrl } = await import('@/lib/seo');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://skillvedika.com';
  const canonicalUrl = getCanonicalUrl('/terms-and-conditions/instructor');
  const [organizationSchema, websiteSchema] = await getBaseSchemas();

  const webPageSchema = generateWebPageSchema(canonicalUrl, {
    name: 'Instructor Terms & Conditions | SkillVedika',
    description:
      "Read SkillVedika's terms and conditions for instructors, including compensation, course creation guidelines, and instructor responsibilities.",
    inLanguage: 'en-US',
    siteName: 'SkillVedika',
    siteUrl: siteUrl,
    organizationName: 'SkillVedika',
    organizationUrl: siteUrl,
  });

  if (!terms) {
    return (
      <section className="max-w-4xl mx-auto py-10 px-5 text-gray-800">
        <StructuredData data={[organizationSchema, websiteSchema, webPageSchema]} />
        <h1 className="text-4xl font-bold text-blue-800 mb-6">Instructor Terms & Conditions</h1>
        <div className="prose max-w-none">
          <p className="text-red-500 mb-4">
            Unable to load terms at the moment. Please check the console for details.
          </p>
          <p className="text-gray-600">
            For now, please contact our support team for instructor terms and conditions.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-4xl mx-auto py-10 px-5 text-gray-800">
      {/* Structured Data for SEO */}
      <StructuredData data={[organizationSchema, websiteSchema, webPageSchema]} />
      {/* Title */}
      <h1 className="text-4xl font-bold text-blue-800 mb-6">
        {terms?.title || 'Instructor Terms & Conditions'}
      </h1>
      <p className="text-sm text-gray-600 mb-6 italic">
        These terms and conditions are specifically for instructors teaching on SkillVedika
        platform.
      </p>

      {/* Tiptap HTML content */}
      <SafeHTML
        html={terms?.content || '<p>No content available</p>'}
        className="prose max-w-none mb-6"
      />
    </section>
  );
}
