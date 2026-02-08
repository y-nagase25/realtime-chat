import type {
  ComprehensionQuestion,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  FillInBlankQuestion,
  SummaryQuestion,
} from '@/lib/types/reading';

export const mockMultipleChoiceQuestion: MultipleChoiceQuestion = {
  id: '1',
  type: 'multiple-choice',
  question: 'What is the capital of France?',
  options: ['Paris', 'London', 'Berlin', 'Madrid'],
  correctAnswer: 0,
  explanation: 'Paris is the capital of France.',
  explanationJa: 'パリはフランスの首都です。',
};

export const mockTrueFalseQuestion: TrueFalseQuestion = {
  id: '2',
  type: 'true-false',
  question: 'The capital of France is Paris.',
  correctAnswer: true,
  explanation: 'The capital of France is Paris.',
  explanationJa: 'フランスの首都はパリです。',
};

export const mockFillInBlankQuestion: FillInBlankQuestion = {
  id: '3',
  type: 'fill-in-blank',
  question: 'The capital of France is ____.',
  correctAnswer: 'Paris',
  acceptableAnswers: ['Paris', 'paris', 'PARIS'],
  explanation: 'The capital of France is Paris.',
  explanationJa: 'フランスの首都はパリです。',
};

export const mockSummaryQuestion: SummaryQuestion = {
  id: '4',
  type: 'summary',
  question: 'Summarize the passage',
  questionJa: 'この文章を要約してください',
  explanation: 'Summary explanation',
  explanationJa: '要約の説明',
};

export const mockQuestions: ComprehensionQuestion[] = [
  mockMultipleChoiceQuestion,
  mockTrueFalseQuestion,
  mockFillInBlankQuestion,
];
