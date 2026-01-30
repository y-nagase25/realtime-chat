import { getSupabaseClient } from '@/lib/supabase';
import type { ApiType, TokenUsageInsert } from '@/lib/types/db';
import type { ResponseUsage } from 'openai/resources/responses/responses';
import type { Completion, CompletionUsage } from 'openai/resources';
import type { ChatCompletion } from 'openai/resources/chat/completions';

/**
 * Track OpenAI API token usage in Supabase database
 *
 * This function uses a fire-and-forget pattern and will not throw errors.
 * Failed tracking attempts are logged but do not affect API responses.
 *
 * @param data - Token usage data to record
 * @returns Promise<void> - Resolves when tracking completes or fails
 */
export async function trackTokenUsage(data: TokenUsageInsert): Promise<void> {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase.from('token_usage').insert(data);

    if (error) {
      console.error('[Token Tracking] Failed to insert usage record:', {
        error: error.message,
        code: error.code,
        details: error.details,
        api_type: data.api_type,
        model: data.model_name,
      });
    }
  } catch (error) {
    console.error('[Token Tracking] Unexpected error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      api_type: data.api_type,
      model: data.model_name,
    });
  }
}

/**
 * Track text generation API usage
 */
export async function trackTextGeneration(model: string, usage: ResponseUsage): Promise<void> {
  await trackTokenUsage({
    api_type: 'text_generation',
    model_name: model,
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    total_tokens: usage.total_tokens,
  });
}

/**
 * Track audio transcription API usage
 */
export async function trackAudioTranscription(model: string, seconds: number): Promise<void> {
  await trackTokenUsage({
    api_type: 'transcription',
    model_name: model,
    audio_duration_seconds: seconds,
  });
}

/**
 * Track chat completion API usage
 */
export async function trackChatCompletion(
  completion: ChatCompletion | Completion,
  type: ApiType
): Promise<void> {
  const usage = completion.usage as CompletionUsage;
  await trackTokenUsage({
    api_type: type,
    model_name: completion.model,
    input_tokens: usage?.prompt_tokens ?? 0,
    output_tokens: usage?.completion_tokens ?? 0,
    total_tokens: usage?.total_tokens ?? 0,
  });
}
