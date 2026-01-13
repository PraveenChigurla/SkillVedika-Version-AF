import Link from 'next/link';

export default function InternalLinks() {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
            Continue Your Learning Journey
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/courses"
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                Explore Courses
              </h3>
              <p className="text-sm text-gray-600">
                Enroll in expert-led courses to master your skills
              </p>
            </Link>
            <Link
              href="/on-job-support"
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                Job Assistance
              </h3>
              <p className="text-sm text-gray-600">
                Get support during your job search and interviews
              </p>
            </Link>
            <Link
              href="/become-instructor"
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                Become an Instructor
              </h3>
              <p className="text-sm text-gray-600">
                Share your expertise and teach others
              </p>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

