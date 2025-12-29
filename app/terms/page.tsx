import { Metadata } from 'next';
import SafeHTML from '@/components/SafeHTML';

// Force dynamic rendering to fetch metadata from database at request time
export const dynamic = 'force-dynamic';

/* ------------------------------------------------------------------
      DYNAMIC SEO META TAGS FOR TERMS & CONDITIONS PAGE
   Fetches SEO metadata from the `seos` table (id = 10)
------------------------------------------------------------------ */
export async function generateMetadata(): Promise<Metadata> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fallbackTitle = 'Terms & Conditions - SkillVedika';
  const fallbackDescription =
    "Read SkillVedika's terms and conditions, policies, and legal information for our platform.";
  const fallbackKeywords = [
    'terms and conditions',
    'policy',
    'skillvedika terms',
    'legal information',
  ];

  try {
    // Fetch SEO metadata for the Terms page from the `seos` table.
    // id = 8 corresponds to "Terms and Conditions" in the seed data.
    const res = await fetch(`${apiUrl}/seo/8`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch seo/8: ${res.status}`);

    const json = await res.json();
    const content = json?.data ?? json ?? null;

    const { getCanonicalUrl } = await import('@/lib/seo');
    const canonicalUrl = getCanonicalUrl('/terms');

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
    console.error('Error generating terms metadata:', err);
    const { getCanonicalUrl } = await import('@/lib/seo');
    const canonicalUrl = getCanonicalUrl('/terms');

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

async function getTerms() {
  try {
    // Fetch data from Laravel API (dynamic, no caching)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      console.warn('NEXT_PUBLIC_API_URL not configured');
      return null;
    }

    console.log(`Fetching from: ${apiUrl}/terms`);
    const res = await fetch(`${apiUrl}/terms`, { cache: 'no-store' });

    console.log(`Response status: ${res.status}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.warn(`Failed to fetch terms: ${res.status}`, errorText.substring(0, 200));
      return null;
    }

    const response = await res.json();
    console.log('Terms data fetched successfully:', response);

    // Extract data from response - backend returns {success: true, data: {...}}
    const termsData = response?.data ?? response;
    return termsData;
  } catch (err) {
    console.warn('Error fetching terms:', err);
    return null;
  }
}

export default async function TermsPage() {
  const terms = await getTerms();

  /* ----------------------------------------------------
     GENERATE STRUCTURED DATA
  ---------------------------------------------------- */
  const { getBaseSchemas } = await import('@/lib/getBaseSchemas');
  const { generateWebPageSchema } = await import('@/lib/structuredData');
  const { StructuredData } = await import('@/lib/structuredData');
  const { getCanonicalUrl } = await import('@/lib/seo');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://skillvedika.com';
  const canonicalUrl = getCanonicalUrl('/terms');
  const [organizationSchema, websiteSchema] = await getBaseSchemas();

  const webPageSchema = generateWebPageSchema(canonicalUrl, {
    name: 'Terms & Conditions | SkillVedika',
    description:
      "Read SkillVedika's terms and conditions for using our online training platform and services.",
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
        <h1 className="text-4xl font-bold text-blue-800 mb-6">Terms & Conditions</h1>
        <p className="text-red-500">
          Unable to load terms at the moment. Please check the console for details.
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-4xl mx-auto py-10 px-5 text-gray-800">
      {/* Structured Data for SEO */}
      <StructuredData data={[organizationSchema, websiteSchema, webPageSchema]} />
      {/* Title */}
      <h1 className="text-4xl font-bold text-blue-800 mb-6">
        {terms?.title || 'Terms & Conditions'}
      </h1>

      {/* Tiptap HTML content */}
      <SafeHTML
        html={terms?.content || '<p>No content available</p>'}
        className="prose max-w-none mb-6"
      />

      {/* Last updated */}
      <p className="text-sm text-gray-500 mt-10">
        Last Updated:{' '}
        {terms?.last_updated_on ? new Date(terms.last_updated_on).toLocaleDateString() : 'N/A'}
      </p>
    </section>
  );
}
