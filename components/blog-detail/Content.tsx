import SafeHTML from '@/components/SafeHTML';

interface BlogContentProps {
  post: {
    blog_content?: string;
    content?: string;
    body?: string;
  };
}

export default function BlogContent({ post }: BlogContentProps) {
  // Handle both database field names (blog_content) and API field names (content, body)
  const content = post?.blog_content || post?.content || post?.body || '';

  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <article className="prose max-w-none">
          <SafeHTML html={content} />
        </article>
      </div>
    </section>
  );
}
