'use client';

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface QuestionItemProps {
  id: number;
  question: string;
  answer: string;
}

export default function QuestionItem({ id, question, answer }: QuestionItemProps) {
  return (
    <AccordionItem value={`question-${id}`} className="border-b border-gray-200">
      <AccordionTrigger className="text-left hover:no-underline py-4">
        <span className="text-base sm:text-lg font-semibold text-gray-900 pr-4">
          {question}
        </span>
      </AccordionTrigger>
      <AccordionContent className="pb-4">
        <div className="pt-2 text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
          {answer}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

