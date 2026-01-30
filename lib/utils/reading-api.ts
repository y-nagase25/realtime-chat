/**
 * Shared utilities for reading API routes
 * Provides common patterns for request handling and OpenAI API calls
 */

import { type NextRequest, NextResponse } from 'next/server';
import { completionModel, openai } from '@/lib/openai';
import { trackChatCompletion } from '@/lib/utils/track-usage';
import type { ValidationResult } from '@/lib/types/validation';
import type { ApiType } from '@/lib/types/db';

/**
 * Configuration for reading API handler
 */
export type ReadingApiHandlerConfig<TRequest, TResponse> = {
  /** Validation function for the request body */
  validate: (body: unknown) => ValidationResult;
  /** Handler function that processes the validated request */
  handler: (request: TRequest) => Promise<TResponse>;
  /** Error message to show when handler fails */
  errorMessage: string;
};

/**
 * Creates a standardized API route handler for reading endpoints
 *
 * This higher-order function wraps route handlers with:
 * - JSON body parsing
 * - Request validation
 * - Standardized error handling
 * - Consistent response format
 *
 * @example
 * ```typescript
 * export const POST = createReadingApiHandler({
 *   validate: validateGeneratePassageRequest,
 *   handler: async (request) => {
 *     // Business logic here
 *     return { title: 'Example', content: '...' };
 *   },
 *   errorMessage: 'Failed to generate passage. Please try again.',
 * });
 * ```
 */
export function createReadingApiHandler<TRequest, TResponse>(
  config: ReadingApiHandlerConfig<TRequest, TResponse>
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    try {
      const body = await request.json();

      const validation = config.validate(body);
      if (!validation.valid) {
        return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
      }

      const data = await config.handler(body as TRequest);

      return NextResponse.json({ success: true, data });
    } catch (error) {
      console.error(`Reading API error: ${config.errorMessage}`, error);

      if (error instanceof SyntaxError) {
        return NextResponse.json(
          { success: false, error: 'Invalid JSON in request body' },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: false, error: config.errorMessage }, { status: 500 });
    }
  };
}

/**
 * Calls OpenAI API with JSON response format and tracks usage
 *
 * @param systemPrompt - The system prompt for the completion
 * @param maxTokens - Maximum tokens for the completion
 * @returns Parsed JSON response from OpenAI
 * @throws Error if no response from AI
 *
 * @example
 * ```typescript
 * const result = await getJsonCompletion<{ title: string }>(
 *   'Generate a title in JSON format: {"title": "..."}',
 *   500
 * );
 * console.log(result.title);
 * ```
 */
export async function getJsonCompletion<T>(
  systemPrompt: string,
  maxTokens: number,
  apiType: ApiType = 'reading'
): Promise<T> {
  const completion = await openai.chat.completions.create({
    model: completionModel,
    messages: [{ role: 'system', content: systemPrompt }],
    response_format: { type: 'json_object' },
    max_completion_tokens: maxTokens,
  });

  void trackChatCompletion(completion, apiType);

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from AI');
  }

  return JSON.parse(content) as T;
}
