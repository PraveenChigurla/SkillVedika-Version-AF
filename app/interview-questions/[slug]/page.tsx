
import { Metadata } from 'next';
import InterviewHero from '@/components/interview-questions/InterviewHero';
import QuestionList from '@/components/interview-questions/QuestionList';
import InternalLinks from '@/components/interview-questions/InternalLinks';
import DemoSection from '@/components/blog-detail/DemoSection';
import { getCanonicalUrl } from '@/lib/seo';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

/* --------------------------------
   Metadata (SEO)
-------------------------------- */
export async function generateMetadata(
  props: PageProps
): Promise<Metadata> {
  const { slug } = await props.params; // ✅ REQUIRED in Next 16
  const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
  const canonicalUrl = getCanonicalUrl(`/interview-questions/${slug}`);

  try {
    const res = await fetch(
      `${apiUrl}/interview-questions/${slug}`,
      { cache: 'no-store' }
    );

    if (!res.ok) {
      throw new Error('Metadata fetch failed');
    }

    const { category } = await res.json();

    return {
      title: `${category.name} Interview Questions & Answers`,
      description: category.description,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: `${category.name} Interview Questions & Answers | SkillVedika`,
        description: category.description,
        url: canonicalUrl,
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${category.name} Interview Questions & Answers | SkillVedika`,
        description: category.description,
      },
    };
  } catch {
    return {
      title: 'Interview Questions | SkillVedika',
      alternates: { canonical: canonicalUrl },
    };
  }
}

/* --------------------------------
   Page Component
-------------------------------- */
export default async function InterviewQuestionDetailPage(
  props: PageProps
) {
  const { slug } = await props.params; // ✅ REQUIRED
  const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

  const res = await fetch(
    `${apiUrl}/interview-questions/${slug}`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    notFound();
  }

  const { category, questions } = await res.json();

  /* ---- Fetch courses & form ---- */
  let allCourses: any[] = [];
  let formDetails: any = null;

  try {
    const [coursesRes, formDetailsRes] = await Promise.allSettled([
      fetch(`${apiUrl}/courses`, { next: { revalidate: 86400 } }),
      fetch(`${apiUrl}/form-details`, { next: { revalidate: 3600 } }),
    ]);

    if (coursesRes.status === 'fulfilled' && coursesRes.value.ok) {
      const json = await coursesRes.value.json();
      allCourses = json?.data || json || [];
    }

    if (formDetailsRes.status === 'fulfilled' && formDetailsRes.value.ok) {
      const json = await formDetailsRes.value.json();
      formDetails = Array.isArray(json?.data)
        ? json.data[json.data.length - 1]
        : json?.data || json;
    }
  } catch {
    // silent fail
  }

  return (
    <main className="min-h-screen bg-white">
      <InterviewHero
        skillName={category.name}
        description={category.description}
      />

      <QuestionList
        questions={questions.map((q: any) => ({
          id: q.id,
          question: q.question,
          answer: q.answer,
        }))}
      />

      <InternalLinks />

      <DemoSection
        allCourses={allCourses}
        formDetails={formDetails}
      />
    </main>
  );
}
