import { Metadata } from 'next';
import SafeHTML from '@/components/SafeHTML';

// Force dynamic rendering to fetch metadata from database at request time
export const dynamic = 'force-dynamic';

/* ------------------------------------------------------------------
      DYNAMIC SEO META TAGS FOR PRIVACY POLICY PAGE
   Fetches SEO metadata from the `seos` table
------------------------------------------------------------------ */
export async function generateMetadata(): Promise<Metadata> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fallbackTitle = 'Privacy Policy - SkillVedika';
  const fallbackDescription =
    "Read SkillVedika's privacy policy to understand how we collect, use, and protect your personal information.";
  const fallbackKeywords = [
    'privacy policy',
    'data protection',
    'privacy',
    'skillvedika privacy',
    'user privacy',
  ];

  try {
    // Fetch SEO metadata for the Privacy Policy page from the `seos` table.
    // id = 19 corresponds to "Privacy Policy" in the seed data.
    const res = await fetch(`${apiUrl}/seo?slug=privacy-policy`, { cache: 'no-store' });
    
    let content = null;
    if (res.ok) {
      const json = await res.json();
      content = json?.data ?? json ?? null;
    } else {
      // SEO entry doesn't exist (404) - use fallback metadata
      console.warn(`SEO entry 9 not found, using fallback metadata for privacy policy`);
    }

    const { getCanonicalUrl } = await import('@/lib/seo');
    const canonicalUrl = getCanonicalUrl('/privacy');

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
    console.error('Error generating privacy metadata:', err);
    const { getCanonicalUrl } = await import('@/lib/seo');
    const canonicalUrl = getCanonicalUrl('/privacy');

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

async function getPrivacyPolicy() {
  try {
    // Fetch data from Laravel API (dynamic, no caching)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      console.warn('NEXT_PUBLIC_API_URL not configured');
      return null;
    }

    console.log(`Fetching from: ${apiUrl}/legal/privacy`);
    const res = await fetch(`${apiUrl}/legal/privacy`, { cache: 'no-store' });

    console.log(`Response status: ${res.status}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.warn(`Failed to fetch privacy policy: ${res.status}`, errorText.substring(0, 200));
      return null;
    }

    const response = await res.json();
    console.log('Privacy policy data fetched successfully:', response);

    // Extract data from response - backend returns {success: true, data: {...}}
    const privacyData = response?.data ?? response;
    return privacyData;
  } catch (err) {
    console.warn('Error fetching privacy policy:', err);
    return null;
  }
}

export default async function PrivacyPage() {
  const privacy = await getPrivacyPolicy();

  /* ----------------------------------------------------
     GENERATE STRUCTURED DATA
  ---------------------------------------------------- */
  const { getBaseSchemas } = await import('@/lib/getBaseSchemas');
  const { generateWebPageSchema } = await import('@/lib/structuredData');
  const { StructuredData } = await import('@/lib/structuredData');
  const { getCanonicalUrl } = await import('@/lib/seo');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://skillvedika.com';
  const canonicalUrl = getCanonicalUrl('/privacy');
  const [organizationSchema, websiteSchema] = await getBaseSchemas();

  const webPageSchema = generateWebPageSchema(canonicalUrl, {
    name: 'Privacy Policy | SkillVedika',
    description:
      "Read SkillVedika's privacy policy to understand how we collect, use, and protect your personal information.",
    inLanguage: 'en-US',
    siteName: 'SkillVedika',
    siteUrl: siteUrl,
    organizationName: 'SkillVedika',
    organizationUrl: siteUrl,
  });

  if (!privacy) {
    return (
      <section className="max-w-4xl mx-auto py-10 px-5 text-gray-800">
        <StructuredData data={[organizationSchema, websiteSchema, webPageSchema]} />
        <h1 className="text-4xl font-bold text-blue-800 mb-6">Privacy Policy</h1>
        <div className="prose max-w-none">
          <p className="text-red-500 mb-4">
            Unable to load privacy policy at the moment. Please check the console for details.
          </p>
          <p className="text-gray-600">
            For now, please contact our support team for privacy policy information.
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
        {privacy?.title || 'Privacy Policy'}
      </h1>

      {/* Tiptap HTML content */}
      <SafeHTML
        html={privacy?.content || '<p>No content available</p>'}
        className="prose max-w-none mb-6"
      />
    </section>
  );
}

