import dynamicImport from 'next/dynamic';
import { Metadata } from 'next';

// Lazy load components for better performance
const Hero = dynamicImport(() => import('@/components/blog/hero'));
const BlogSection = dynamicImport(() => import('@/components/blog/blog-section'));
const DemoSection = dynamicImport(() => import('@/components/blog/demo-section'));

// Force dynamic rendering to fetch metadata from database at request time
export const dynamic = 'force-dynamic';

/* ------------------------------------------------------------------
      DYNAMIC SEO META TAGS FOR BLOG LISTING PAGE
   Uses `/blog-page` API to populate meta_title, meta_description, meta_keywords
------------------------------------------------------------------ */
export async function generateMetadata(): Promise<Metadata> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fallbackTitle = 'Blogs | SkillVedika – Latest Tech Insights, Tutorials & Learning Guides';
  const fallbackDescription =
    'Explore SkillVedika’s latest blogs on software development, programming, AI, cloud computing, data science, career growth, and emerging technologies. Stay updated and enhance your learning journey.';
  const fallbackKeywords = [
    'SkillVedika blogs',
    'tech blogs',
    'programming tutorials',
    'software development articles',
    'data science blogs',
    'AI learning blogs',
    'cloud computing guides',
    'IT career tips',
    'web development blogs',
    'SkillVedika learning resources',
  ];

  try {
    // Fetch SEO metadata for the Blog page from the `seos` table.
    // id = 6 corresponds to "Blog Listing" in the seed data.
    const res = await fetch(`${apiUrl}/seo?slug=blog`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch seo/6: ${res.status}`);

    const json = await res.json();
    const content = json?.data ?? json ?? null;

    const { getCanonicalUrl } = await import('@/lib/seo');
    const canonicalUrl = getCanonicalUrl('/blog');

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
      twitter: { card: 'summary_large_image', title: metaTitle, description: metaDescription },
    };
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error generating blog metadata:', err);
    }    
    const { getCanonicalUrl } = await import('@/lib/seo');
    const canonicalUrl = getCanonicalUrl('/blog');

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

export default async function BlogPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // ⚡ OPTIMIZATION: Fetch all data in parallel for better performance
  const [contentRes, coursesRes, formDetailsRes] = await Promise.allSettled([
    fetch(`${apiUrl}/blog-page`, { cache: 'no-store' }),
    fetch(`${apiUrl}/courses`, { next: { revalidate: 86400 } }),
    fetch(`${apiUrl}/form-details`, { cache: 'no-store' }),
  ]);

  // Process content
  let content: any = null;
  if (contentRes.status === 'fulfilled' && contentRes.value.ok) {
    try {
      const json = await contentRes.value.json();
      content = json.data || json;
    } catch (error) {
      console.error('Error parsing blog content:', error);
    }
  }

  // Process courses
  let allCourses: any[] = [];
  if (coursesRes.status === 'fulfilled' && coursesRes.value.ok) {
    try {
      const json = await coursesRes.value.json();
      allCourses = Array.isArray(json) ? json : json?.data || json?.courses || [];
      if (!Array.isArray(allCourses)) {
        allCourses = [];
      }
    } catch (error) {
      console.error('Error parsing courses:', error);
    }
  }

  // Process form details
  let formDetails: any = null;
  if (formDetailsRes.status === 'fulfilled' && formDetailsRes.value.ok) {
    try {
      const json = await formDetailsRes.value.json();
      const payload = json.data ?? json;
      formDetails = Array.isArray(payload) ? payload[payload.length - 1] : payload;
    } catch (error) {
      console.error('Error parsing form details:', error);
    }
  }

  /* ---------------------------------------------------
      4️⃣ Handle Missing Content
  ----------------------------------------------------- */
  if (!content) {
    return (
      <main className="min-h-screen flex items-center justify-center text-red-600">
        Failed to load Blog Page content.
      </main>
    );
  }

  /* ---------------------------------------------------
      GENERATE STRUCTURED DATA
  ----------------------------------------------------- */
  const { getBaseSchemas } = await import('@/lib/getBaseSchemas');
  const { generateCollectionPageSchema } = await import('@/lib/structuredData');
  const { StructuredData } = await import('@/lib/structuredData');
  const { getCanonicalUrl } = await import('@/lib/seo');

  const canonicalUrl = getCanonicalUrl('/blog');
  const [organizationSchema, websiteSchema] = await getBaseSchemas();

  // Fetch blogs for CollectionPage schema
  let blogs: any[] = [];
  try {
    const blogsRes = await fetch(`${apiUrl}/blogs`, {
      next: { revalidate: 3600 },
    });
    if (blogsRes.ok) {
      const blogsData = await blogsRes.json();
      blogs = Array.isArray(blogsData) ? blogsData : blogsData?.data || [];
    }
  } catch (err) {
    // Silently fail
  }

  // Generate CollectionPage schema
  const collectionPageSchema = generateCollectionPageSchema(canonicalUrl, {
    name: content.hero_title || 'Blog',
    description:
      content.hero_description || 'Read the latest articles and insights from SkillVedika',
    items: blogs.slice(0, 20).map((blog: any) => ({
      name: blog.title || 'Blog Post',
      url: `${canonicalUrl.split('/blog')[0]}/blog/${blog.slug || blog.id}`,
      type: 'BlogPosting',
    })),
  });

  /* ---------------------------------------------------
      5️⃣ Render Page
  ----------------------------------------------------- */
  return (
    <main className="min-h-screen bg-white">
      {/* Structured Data for SEO */}
      <StructuredData data={[organizationSchema, websiteSchema, collectionPageSchema]} />

      <Hero
        title={content.hero_title}
        description={content.hero_description}
        image={content.hero_image}
      />

      <BlogSection sidebarName={content.sidebar_name} />

      <DemoSection
        allCourses={allCourses}
        title={content.demo_title}
        subtitle={content.demo_subtitle}
        points={content.demo_points}
        formDetails={formDetails}
      />
    </main>
  );
}
