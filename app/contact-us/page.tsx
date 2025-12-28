import HeroSection from '@/components/contact-us/heroSection';
import ContactInfo from '@/components/contact-us/contactInfo';
import MapSection from '@/components/contact-us/mapSection';
import DemoSection from '@/components/contact-us/demoSection';
import { Metadata } from 'next';
import { StructuredData, generateContactPageSchema } from '@/lib/structuredData';
import { getBaseSchemas } from '@/lib/getBaseSchemas';
import { getCanonicalUrl } from '@/lib/seo';

// Force dynamic rendering to fetch metadata from database at request time
export const dynamic = 'force-dynamic';

/* ----------------------------------------------------
      DYNAMIC SEO META TAGS FOR CONTACT-US PAGE
   Fetches meta fields from the API so editors can change SEO
---------------------------------------------------- */
export async function generateMetadata(): Promise<Metadata> {
  const { getApiUrl } = await import('@/lib/apiConfig');
  const apiUrl = getApiUrl('/seo/7');

  const fallbackTitle = 'Contact Us | SkillVedika – Connect With Our Training & Support Team';
  const fallbackDescription =
    'Get in touch with SkillVedika for course inquiries, demo sessions, corporate training, job support, and admissions guidance. Contact us via email, phone, or visit our global offices.';
  const fallbackKeywords = [
    'SkillVedika contact',
    'SkillVedika support',
    'Contact SkillVedika',
    'training institute contact',
    'online course support',
    'corporate training enquiries',
    'IT training contact',
    'job support contact',
    'SkillVedika USA office',
    'SkillVedika Hyderabad office',
  ];

  try {
    // Fetch SEO metadata for the Contact page from the `seos` table.
    // We fetch the specific row by primary key (id = 7) which corresponds
    // to the Contact page in the seed data. This keeps content and SEO
    // separate (admins can manage SEO independently).
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch contact page metadata: ${res.status}`);
    }

    const json = await res.json();
    const content = json?.data ?? json ?? null;

    const { getCanonicalUrl } = await import('@/lib/seo');
    const canonicalUrl = getCanonicalUrl('/contact-us');

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
    // Return fallback metadata on failure
    console.error('Error generating metadata for Contact Us page:', err);
    const { getCanonicalUrl } = await import('@/lib/seo');
    const canonicalUrl = getCanonicalUrl('/contact-us');

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

export default async function ContactUsPage() {
  const { getApiUrl } = await import('@/lib/apiConfig');

  // ⚡ OPTIMIZATION: Fetch all data in parallel for better performance
  const [coursesRes, contentRes, formDetailsRes] = await Promise.allSettled([
    fetch(getApiUrl('/courses'), { next: { revalidate: 86400 } }),
    fetch(getApiUrl('/contact-page'), { cache: 'no-store' }),
    fetch(getApiUrl('/form-details'), { cache: 'no-store' }),
  ]);

  // Process courses
  let allCourses: any[] = [];
  if (coursesRes.status === 'fulfilled' && coursesRes.value.ok) {
    try {
      const json = await coursesRes.value.json();
      allCourses = Array.isArray(json) ? json : json?.data || json?.courses || [];
      if (!Array.isArray(allCourses)) {
        allCourses = [];
      }
    } catch (err) {
      console.error('Error parsing courses:', err);
    }
  }

  // Process content
  let content: any = null;
  if (contentRes.status === 'fulfilled' && contentRes.value.ok) {
    try {
      const json = await contentRes.value.json();
      content = json?.data ?? json ?? null;
    } catch (err) {
      console.error('Error parsing contact page content:', err);
    }
  }

  // Process form details
  let formDetails: any = null;
  if (formDetailsRes.status === 'fulfilled' && formDetailsRes.value.ok) {
    try {
      const json = await formDetailsRes.value.json();
      const payload = json.data ?? json;
      formDetails = Array.isArray(payload) ? payload[payload.length - 1] : payload;
    } catch (err) {
      console.error('Error parsing form details:', err);
    }
  }

  /* ----------------------------------------------------
     SAFETY BLOCK
  ---------------------------------------------------- */
  if (!content) {
    return (
      <main className="min-h-screen flex items-center justify-center text-red-600">
        Failed to load Contact Us page content.
      </main>
    );
  }

  /* ----------------------------------------------------
     GENERATE STRUCTURED DATA
  ---------------------------------------------------- */
  const canonicalUrl = getCanonicalUrl('/contact-us');

  // Fetch footer settings for organization data (email, phone, social links)
  let footerSettings: any = null;
  try {
    const footerRes = await fetch(getApiUrl('/footer-settings'), {
      cache: 'force-cache',
      next: { revalidate: 3600 },
    });
    if (footerRes.ok) {
      footerSettings = await footerRes.json();
    }
  } catch (err) {
    // Silently fail - use defaults
  }

  const contactDetails = footerSettings?.contact_details || content?.contact_details || {};
  const socialLinks = footerSettings?.social_links || {};

  // Build sameAs array from social links (only valid URLs)
  const sameAs: string[] = [];
  if (socialLinks.instagram && !socialLinks.instagram.startsWith('#')) {
    sameAs.push(socialLinks.instagram);
  }
  if (socialLinks.twitter && !socialLinks.twitter.startsWith('#')) {
    sameAs.push(socialLinks.twitter);
  }
  if (socialLinks.youtube && !socialLinks.youtube.startsWith('#')) {
    sameAs.push(socialLinks.youtube);
  }
  if (socialLinks.facebook && !socialLinks.facebook.startsWith('#')) {
    sameAs.push(socialLinks.facebook);
  }

  // Parse addresses from location strings
  const addresses: Array<{
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  }> = [];

  if (content?.contactus_location1_address) {
    // Parse USA address
    const usaAddress = content.contactus_location1_address;
    addresses.push({
      streetAddress: usaAddress,
      addressCountry: 'US',
    });
  }

  if (content?.contactus_location2_address) {
    // Parse India address
    const indiaAddress = content.contactus_location2_address;
    addresses.push({
      streetAddress: indiaAddress,
      addressLocality: 'Hyderabad',
      addressRegion: 'Telangana',
      addressCountry: 'IN',
    });
  }

  // Generate base schemas (Organization + WebSite)
  const [organizationSchema, websiteSchema] = await getBaseSchemas({
    email: contactDetails.email || content?.contacts_email_id,
    phone: contactDetails.phone || content?.contacts_phone_number,
    addresses: addresses.length > 0 ? addresses : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    description: footerSettings?.about,
  });

  // Generate ContactPage schema
  const baseUrl = canonicalUrl.split('/contact-us')[0] || canonicalUrl.replace('/contact-us', '');
  const contactPageSchema = generateContactPageSchema(canonicalUrl, {
    name: 'SkillVedika',
    url: baseUrl,
    logo: `${baseUrl}/skillvedika-logo.png`,
    description:
      footerSettings?.about ||
      'SkillVedika offers industry-ready online courses, corporate training, and job support programs.',
    email: contactDetails.email || content?.contacts_email_id,
    phone: contactDetails.phone || content?.contacts_phone_number,
    addresses: addresses.length > 0 ? addresses : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  });

  /* ----------------------------------------------------
     RENDER PAGE
  ---------------------------------------------------- */
  return (
    <div className="w-full">
      {/* Structured Data for SEO */}
      <StructuredData data={[organizationSchema, websiteSchema, contactPageSchema]} />

      <HeroSection
        title={content.hero_title ?? null}
        description={content.hero_description ?? ''}
        buttonText={content.hero_button ?? ''}
        image={content.hero_image ?? ''}
      />

      <ContactInfo
        targetLabel={content.contactus_target}
        title={content.contactus_title}
        subtitle={content.contactus_subtitle}
        emailLabel={content.contacts_email_label}
        emailId={content.contacts_email_id}
        emailLink={content.contacts_email_id_link}
        phoneLabel={content.contacts_phone_label}
        phoneNumber={content.contacts_phone_number}
        phoneLink={content.contacts_phone_number_link}
        location1Label={content.contactus_location1_label}
        location1Address={content.contactus_location1_address}
        location1Link={content.contactus_location1_address_link}
        location2Label={content.contactus_location2_label}
        location2Address={content.contactus_location2_address}
        location2Link={content.contactus_location2_address_link}
      />

      <MapSection
        title={content.map_title}
        subtitle={content.map_subtitle}
        mapLink={content.map_link}
        mapLinkIndia={content.map_link_india}
      />

      <DemoSection
        allCourses={allCourses}
        target={content.demo_target}
        title={content.demo_title}
        subtitle={content.demo_subtitle}
        points={content.demo_points}
        formDetails={formDetails}
      />
    </div>
  );
}
