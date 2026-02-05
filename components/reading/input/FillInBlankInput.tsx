'use client';

import { Input } from '@/components/ui/input';
import type { FillInBlankQuestion } from '@/lib/types/reading';

/**
 * Fill-in-the-blank question input with text field
 */
export function FillInBlankInput({
  question,
  value,
  onChange,
}: {
  question: FillInBlankQuestion;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Input
      data-testid={`input-${question.id}`}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="回答を入力..."
      className="max-w-sm"
    />
  );
}
