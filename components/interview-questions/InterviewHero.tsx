interface InterviewHeroProps {
  skillName: string;
  description: string;
}

export default function InterviewHero({ skillName, description }: InterviewHeroProps) {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {skillName} Interview Questions and Answers
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">{description}</p>
      </div>
    </section>
  );
}

