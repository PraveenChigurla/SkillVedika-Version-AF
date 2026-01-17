import { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

// Default fallback data
const defaultPageContent = {
  heroTitle: 'Interview Questions by Skill',
  heroDescription: 'Prepare for your next technical interview with comprehensive questions and answers across top programming languages, frameworks, and technologies.',
};


export async function generateMetadata(): Promise<Metadata> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fallbackTitle = 'Interview Questions by Skill';
  const fallbackDescription =
    'Browse interview questions for top skills like Python, Salesforce, Java, AI, and more. Prepare for technical interviews with comprehensive Q&A.';
  const fallbackKeywords = [
    'interview questions',
    'technical interview',
    'Python interview questions',
    'Java interview questions',
    'JavaScript interview questions',
    'Salesforce interview questions',
    'coding interview',
    'interview preparation',
  ];

  try {
    // Fetch SEO metadata for the Interview Questions page from the `seos` table.
    // id = 22 corresponds to "Interview Questions" in the seed data.
    const res = await fetch(`${apiUrl}/seo?slug=interview-questions`, { cache: 'no-store' });
    
    let content = null;
    if (res.ok) {
      const json = await res.json();
      content = json?.data ?? json ?? null;
    } else {
      console.warn(`SEO entry 22 not found, using fallback metadata for interview questions`);
    }

    const canonicalUrl = getCanonicalUrl('/interview-questions');

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
    console.error('Error generating interview questions metadata:', err);
    const canonicalUrl = getCanonicalUrl('/interview-questions');
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

async function fetchPageContent() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  try {
    const res = await fetch(`${apiUrl}/interview-questions-page`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      return json?.data || null;
    }
  } catch (err) {
    console.error('Error fetching interview questions page content:', err);
  }
  return null;
}

async function fetchCategories() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  try {
    const res = await fetch(`${apiUrl}/interview-question-categories`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      return json?.data || [];
    }
  } catch (err) {
    console.error('Error fetching interview question categories:', err);
  }
  return [];
}

export default async function InterviewQuestionsPage() {
  // Fetch page content and categories in parallel
  const [pageContent, categories] = await Promise.all([
    fetchPageContent(),
    fetchCategories(),
  ]);

  const heroTitle = pageContent?.hero_title || defaultPageContent.heroTitle;
  const heroDescription = pageContent?.hero_description || defaultPageContent.heroDescription;

  // Filter categories that are visible (show = true)
  const visibleCategories = categories.filter((cat: any) => cat.show !== false);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {heroTitle}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl leading-relaxed">
            {heroDescription}
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {visibleCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {visibleCategories.map((category: any) => (
                <Link
                  key={category.id}
                  href={`/interview-questions/${category.slug}`}
                  className="group bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200"
                >
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {category.description || 'Explore interview questions for this skill.'}
                  </p>
                  <div className="flex items-center text-sm text-blue-600 font-medium">
                    <span>{category.question_count || 0} Questions</span>
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No interview question categories available yet.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

