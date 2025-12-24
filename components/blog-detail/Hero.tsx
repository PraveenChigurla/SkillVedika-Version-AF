import Image from 'next/image';

export default function BlogHero({ post, img }: any) {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-gray-300"></div>
          <div>
            <p className="font-semibold text-gray-900">
              {post?.published_by || post?.author || 'Admin'}
            </p>
            <p className="text-sm text-gray-500">
              Posted on {post?.published_at ? new Date(post.published_at).toDateString() : ''}
            </p>
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-8 text-gray-900">
          {post?.blog_name || post?.title || 'Blog'}
        </h1>

        <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-8 md:mb-12 bg-gray-200">
          <Image
            src={img}
            alt={post?.title || post?.blog_name || 'Blog'}
            width={1200}
            height={800}
            className="w-full h-full object-cover"
            quality={85}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          />
        </div>
      </div>
    </section>
  );
}
