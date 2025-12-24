import BlogHero from '@/components/blog-detail/Hero';
import BlogContent from '@/components/blog-detail/Content';
import RecentBlogs from '@/components/blog-detail/RecentBlogs';
import DemoSection from '@/components/blog-detail/DemoSection';
import fs from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';

// Helper to resolve slug from props
async function resolveSlug(props: any): Promise<string> {
  const propsResolved = await props;
  const paramsResolved = await propsResolved.params;
  const slugRaw = paramsResolved?.slug;
  return Array.isArray(slugRaw) ? slugRaw[0] : slugRaw;
}

// Helper to get API URL
function getApiUrl(): string {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  return apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`;
}

// Helper to fetch blog post
async function fetchBlogPost(api: string, slug: string): Promise<any> {
  try {
    const res = await fetch(`${api}/blogs/${slug}`, { cache: 'no-store' });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Silently fail
  }
  return null;
}

// Helper to process image URL
function processImageUrl(imageRaw: string, backendOrigin: string): string {
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
  
  return imageClean.startsWith('/')
    ? `${backendOrigin}${imageClean}`
    : `${backendOrigin}/${imageClean}`;
}

// Helper to build metadata from post
function buildMetadataFromPost(post: any, canonicalUrl: string, image: string) {
  const metaTitle = post.meta_title || post.blog_name;
  const metaDescription =
    post.meta_description ||
    (post.blog_content ? post.blog_content.replaceAll(/<[^>]*>/g, '').slice(0, 155) : '');
  const metaKeywords = post.meta_keywords
    ? post.meta_keywords.split(',').map((k: string) => k.trim())
    : [];

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      images: [image],
      type: 'article',
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [image],
    },
  };
}

/* ============================================================
   1. DYNAMIC METADATA (Next 16 safe version)
============================================================ */
export async function generateMetadata(props: any) {
  const slug = await resolveSlug(props);
  const api = getApiUrl();
  const post = await fetchBlogPost(api, slug);

  if (!post) {
    return {
      title: 'Blog Not Found | SkillVedika',
      description: 'The requested blog post could not be found.',
    };
  }

  const backendOrigin = api.replace(/\/api$/, '');
  const imageRaw = post.thumbnail_image || post.banner_image || '/placeholder.svg';
  const image = processImageUrl(imageRaw, backendOrigin);
  
  const { getCanonicalUrl } = await import('@/lib/seo');
  const canonicalUrl = getCanonicalUrl(`/blog/${slug}`);

  return buildMetadataFromPost(post, canonicalUrl, image);
}

// Helper to process image from post
function processPostImage(post: any): string {
  let img = post?.thumbnail_image || post?.banner_image || post?.images || '/placeholder.svg';

  if (typeof img === 'string' && img.startsWith('[')) {
    try {
      const parsed = JSON.parse(img);
      img = parsed.thumbnail || parsed.banner || Object.values(parsed)[0] || '/placeholder.svg';
    } catch {
      // Silently fail
    }
  }

  if (typeof img === 'string') {
    img = img.replaceAll(/\r?\n/g, '').trim();
  }

  return img;
}

// Helper to fetch recent blogs with fallback
async function fetchRecentBlogs(api: string): Promise<any[]> {
  try {
    const res = await fetch(`${api}/blogs?recent=yes`, {
      cache: 'force-cache',
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list) && list.length > 0) {
        return list.slice(0, 6);
      }
    }
  } catch {
    // Silently fail
  }

  // Fallback to all blogs
  try {
    const fallbackRes = await fetch(`${api}/blogs`, {
      cache: 'force-cache',
      next: { revalidate: 300 },
    });
    if (fallbackRes.ok) {
      const list = await fallbackRes.json();
      return Array.isArray(list) ? list.slice(0, 6) : [];
    }
  } catch {
    // Silently fail
  }

  return [];
}

// Helper to process API response
async function processResponse<T>(
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

/* ============================================================
   2. PAGE COMPONENT — Updated for Next.js 16
============================================================ */
export default async function BlogDetailPage(props: any) {
  const cleanSlug = await resolveSlug(props);
  const envBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';
  const api = envBase.endsWith('/api') ? envBase : `${envBase}/api`;

  // ⚡ OPTIMIZATION: Fetch all data in parallel for better performance
  const [postRes, , coursesRes, formDetailsRes] = await Promise.allSettled([
    fetch(`${api}/blogs/${cleanSlug}`, { cache: 'force-cache', next: { revalidate: 300 } }),
    fetch(`${api}/blogs?recent=yes`, { cache: 'force-cache', next: { revalidate: 300 } }),
    fetch(`${api}/courses`, { next: { revalidate: 86400 } }),
    fetch(`${api}/form-details`, { cache: 'force-cache', next: { revalidate: 3600 } }),
  ]);

  // Process all responses
  const post = await processResponse(postRes, (json) => json, null);
  const recentBlogs = await fetchRecentBlogs(api);
  const allCourses = await processResponse(
    coursesRes,
    (json) => Array.isArray(json) ? json : json?.data || json?.courses || [],
    []
  );
  const formDetails = await processResponse(
    formDetailsRes,
    (json) => {
      const payload = json.data ?? json;
      return Array.isArray(payload) ? (payload.at(-1) ?? null) : payload;
    },
    null
  );

  // Process image
  const img = post ? processPostImage(post) : '/placeholder.svg';

  /* -----------------------------
     If post STILL not found
  ----------------------------- */
  if (!post) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Not Found</h1>
          <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
          <a href="/blog" className="text-blue-600 hover:underline">
            Back to Blogs
          </a>
        </div>
      </main>
    );
  }

  // Ensure absolute URL for images
  const backendOrigin = api.replace(/\/api$/, '');
  const finalImage = processImageUrl(img, backendOrigin);

  /* -----------------------------
     GENERATE STRUCTURED DATA
  ----------------------------- */
  const { getBaseSchemas } = await import('@/lib/getBaseSchemas');
  const { generateBlogPostingSchema } = await import('@/lib/structuredData');
  const { StructuredData } = await import('@/lib/structuredData');
  const { getCanonicalUrl } = await import('@/lib/seo');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://skillvedika.com';
  const canonicalUrl = getCanonicalUrl(`/blog/${cleanSlug}`);
  const [organizationSchema, websiteSchema] = await getBaseSchemas();

  // Generate BlogPosting schema
  const blogPostingSchema = generateBlogPostingSchema({
    headline: post.title || 'Blog Post',
    description: post.description || post.excerpt || post.meta_description || '',
    image: finalImage,
    datePublished: post.published_at || post.created_at || '',
    dateModified: post.updated_at || post.published_at || post.created_at || '',
    url: canonicalUrl,
    authorName: post.author || 'SkillVedika',
    publisherName: 'SkillVedika',
    publisherLogo: `${siteUrl}/skillvedika-logo.png`,
  });

  /* -----------------------------
     Render page successfully
  ----------------------------- */
  return (
    <main className="min-h-screen bg-white">
      {/* Structured Data for SEO */}
      <StructuredData data={[organizationSchema, websiteSchema, blogPostingSchema]} />

      <BlogHero post={post} img={finalImage} />
      <BlogContent post={post} />
      <RecentBlogs blogs={recentBlogs} />
      <DemoSection allCourses={allCourses} formDetails={formDetails} />
    </main>
  );
}

