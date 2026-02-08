'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { TrueFalseQuestion } from '@/lib/types/reading';
import { CORRECT, INCORRECT } from '@/lib/utils/reading-session';

/**
 * True/False question input with radio buttons
 */
export function TrueFalseInput({
  question,
  value,
  onChange,
}: {
  question: TrueFalseQuestion;
  value: boolean | undefined;
  onChange: (value: boolean) => void;
}) {
  return (
    <RadioGroup
      value={value !== undefined ? String(value) : undefined}
      onValueChange={(val) => onChange(val === 'true')}
      aria-labelledby={`question-label-${question.id}`}
      className="space-y-2"
    >
      <div
        data-testid={`option-${question.id}-true`}
        className="flex items-center gap-3 min-h-11 py-2"
      >
        <RadioGroupItem value="true" id={`${question.id}-true`} />
        <Label htmlFor={`${question.id}-true`} className="cursor-pointer">
          {CORRECT}
        </Label>
      </div>
      <div
        data-testid={`option-${question.id}-false`}
        className="flex items-center gap-3 min-h-11 py-2"
      >
        <RadioGroupItem value="false" id={`${question.id}-false`} />
        <Label htmlFor={`${question.id}-false`} className="cursor-pointer">
          {INCORRECT}
        </Label>
      </div>
    </RadioGroup>
  );
}
