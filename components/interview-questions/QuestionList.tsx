'use client';

import { Accordion } from '@/components/ui/accordion';
import QuestionItem from './QuestionItem';

interface Question {
  id: number;
  question: string;
  answer: string;
}

interface QuestionListProps {
  questions: Question[];
}

export default function QuestionList({ questions }: QuestionListProps) {
  if (!questions || questions.length === 0) {
    return (
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-600 text-center">No questions available yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {questions.map((question) => (
            <QuestionItem
              key={question.id}
              id={question.id}
              question={question.question}
              answer={question.answer}
            />
          ))}
        </Accordion>
      </div>
    </section>
  );
}

