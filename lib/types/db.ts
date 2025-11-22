export type Question = {
  id?: number;
  question: string;
  answer: string;
  type?: 'reading' | 'listening' | 'speaking' | 'writing';
  level?: 'beginner' | 'intermediate' | 'advanced';
  created_at?: string;
};
