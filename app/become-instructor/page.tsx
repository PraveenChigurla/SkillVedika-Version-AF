import { Metadata } from 'next';
import HeroSection from '@/components/become-instructor/HeroSection';
import BenefitsSection from '@/components/become-instructor/BenefitsSection';
import CTASection from '@/components/become-instructor/CTASection';
import InstructorForm from '@/components/become-instructor/InstructorForm';
import MobileStickyCTA from '@/components/become-instructor/MobileStickyCTA';
import { getCanonicalUrl } from '@/lib/seo';

// Force dynamic rendering to fetch metadata from database at request time
export const dynamic = 'force-dynamic';

/* ------------------------------------------------------------------
      DYNAMIC SEO META TAGS FOR BECOME INSTRUCTOR PAGE
   Fetches SEO metadata from the `seos` table
------------------------------------------------------------------ */
export async function generateMetadata(): Promise<Metadata> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fallbackTitle = 'Become an Instructor | SkillVedika – Teach & Share Your Expertise';
  const fallbackDescription =
    'Join SkillVedika as an instructor and share your expertise with learners worldwide. Teach online courses, build your reputation, and earn while making a difference.';
  const fallbackKeywords = [
    'Instructor',
    'Trainer',
    'Teach Online',
    'SkillVedika Instructor',
  ];

  try {
    // Fetch SEO metadata for the Become Instructor page from the `seos` table.
    // id = 18 corresponds to "Become an Instructor" in the seed data.
    const res = await fetch(`${apiUrl}/seo?slug=become-instructor`, { cache: 'no-store' });
    
    let content = null;
    if (res.ok) {
      const json = await res.json();
      content = json?.data ?? json ?? null;
    } else {
      console.warn(`SEO entry 18 not found, using fallback metadata for become instructor`);
    }

    const canonicalUrl = getCanonicalUrl('/become-instructor');

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
  } catch (err) {
    console.error('Error generating become instructor metadata:', err);
    const canonicalUrl = getCanonicalUrl('/become-instructor');
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

async function getBecomeInstructorContent() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.warn('NEXT_PUBLIC_API_URL not configured');
      return null;
    }

    const res = await fetch(`${apiUrl}/become-instructor`, { cache: 'no-store' });
    
    if (!res.ok) {
      console.warn(`Failed to fetch become-instructor content: ${res.status}`);
      return null;
    }

    const response = await res.json();
    return response?.data ?? response ?? null;
  } catch (err) {
    console.warn('Error fetching become-instructor content:', err);
    return null;
  }
}

export default async function BecomeInstructorPage() {
  const content = await getBecomeInstructorContent();

  return (
    <>
      <main className="min-h-screen pb-24 md:pb-0">
        <HeroSection 
          title={content?.hero_title || "Become an Instructor at SkillVedika"}
          description={content?.hero_description || "Share your expertise with learners worldwide and build a rewarding teaching career. Join our community of expert instructors and make a lasting impact."}
          buttonText={content?.hero_button_text || "Apply Now"}
          image={content?.hero_image}
        />
        <BenefitsSection 
          title={content?.benefits_title || "Why Become an Instructor?"}
          subtitle={content?.benefits_subtitle || "Join our community of expert instructors and enjoy these amazing benefits"}
          benefits={content?.benefits || []}
        />
        <CTASection 
          title={content?.cta_title || "Ready to Start Your Teaching Journey?"}
          description={content?.cta_description || "Join thousands of instructors who are making a difference. Start your application today and begin sharing your expertise with learners around the world."}
          buttonText={content?.cta_button_text || "Apply Now — It Takes Less Than 2 Minutes"}
        />
        <InstructorForm 
          formTitle={content?.form_title || "Apply to Become an Instructor"}
        />
      </main>

      {/* Mobile Sticky CTA */}
      <MobileStickyCTA />
    </>
  );
}

