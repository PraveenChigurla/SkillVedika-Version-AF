'use client';

export default function MobileStickyCTA() {
  const scrollToForm = () => {
    document
      .getElementById('instructor-form')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-blue-700 px-4 py-3 shadow-[0_-4px_10px_rgba(0,0,0,0.15)]">
      <button
        onClick={scrollToForm}
        className="w-full rounded-lg bg-yellow-400 py-3 text-sm font-semibold text-black hover:bg-yellow-500 transition-colors"
        aria-label="Apply Now - It Takes Less Than 2 Minutes"
      >
        Apply Now – It Takes Less Than 2 Minutes
      </button>
    </div>
  );
}

