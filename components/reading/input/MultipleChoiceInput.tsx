'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { MultipleChoiceQuestion } from '@/lib/types/reading';

/**
 * Multiple choice question input with radio buttons
 */
export function MultipleChoiceInput({
  question,
  value,
  onChange,
}: {
  question: MultipleChoiceQuestion;
  value: number | undefined;
  onChange: (value: number) => void;
}) {
  return (
    <RadioGroup
      value={value !== undefined ? String(value) : undefined}
      onValueChange={(val) => onChange(Number(val))}
      aria-labelledby={`question-label-${question.id}`}
      className="space-y-2"
    >
      {question.options.map((option, index) => (
        <div
          key={option}
          data-testid={`option-${question.id}-${index}`}
          className="flex items-center gap-3 min-h-11 py-2"
        >
          <RadioGroupItem value={String(index)} id={`${question.id}-${index}`} />
          <Label htmlFor={`${question.id}-${index}`} className="cursor-pointer">
            {option}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}
