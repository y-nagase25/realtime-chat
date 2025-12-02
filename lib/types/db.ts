// 'public.questions' table
export interface Question {
  id?: number;
  question: string;
  answer: string;
  type?: 'reading' | 'listening' | 'speaking' | 'writing';
  level?: 'beginner' | 'intermediate' | 'advanced';
  created_at?: string;
}

// 'public.token_usage' table
export type ApiType = 'text_generation' | 'transcription' | 'realtime_session';

export interface TokenUsageInsert {
  api_type: ApiType;
  model_name: string;
  input_tokens?: number | null;
  output_tokens?: number | null;
  total_tokens?: number | null;
  audio_duration_seconds?: number | null;
  cost_usd?: number;
  metadata?: Record<string, unknown> | null;
}

export interface TokenUsageRow extends TokenUsageInsert {
  id: string;
  created_at: string;
}

// Supabase database schema type
export interface Database {
  public: {
    Tables: {
      questions: {
        Row: Question;
        Insert: Omit<Question, 'id' | 'created_at'>;
        Update: Partial<Omit<Question, 'id' | 'created_at'>>;
      };
      token_usage: {
        Row: TokenUsageRow;
        Insert: TokenUsageInsert;
        Update: Partial<TokenUsageInsert>;
      };
    };
  };
}
