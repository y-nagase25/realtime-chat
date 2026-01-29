/**
 * API Route: POST /api/reading/evaluate-summary
 * Evaluates a user's summary of a passage using GPT-5
 */

import { validateEvaluateSummaryRequest } from '@/lib/utils/reading-validation';
import { createReadingApiHandler, getJsonCompletion } from '@/lib/utils/reading-api';
import type { EvaluateSummaryRequest, SummaryFeedback } from '@/lib/types/reading';

/**
 * Build the prompt for summary evaluation
 */
function buildEvaluationPrompt(request: EvaluateSummaryRequest): string {
  return `You are an expert English teacher evaluating a Japanese learner's summary writing.

**Original Passage:**
${request.passage}

**User's Summary:**
${request.userSummary}

**Task:**
Evaluate the user's summary and provide detailed feedback in Japanese to help them improve.

**Evaluation Criteria:**
1. Key points captured from the original passage
2. Key points missed
3. Grammar accuracy
4. Vocabulary usage and appropriateness
5. Overall quality

**Output Format:**
Return a valid JSON object with exactly this structure:
{
  "keyPointsCaptured": ["Key point 1 the user captured", "Key point 2..."],
  "keyPointsMissed": ["Important point 1 the user missed", "Point 2..."],
  "grammarFeedbackJa": "文法に関するフィードバック（日本語で）",
  "vocabularyFeedbackJa": "語彙の使い方に関するフィードバック（日本語で）",
  "overallFeedbackJa": "全体的な評価とアドバイス（日本語で）",
  "modelSummary": "A model summary showing how the passage could be summarized well",
  "score": 75
}

Important:
- keyPointsCaptured and keyPointsMissed should be in English
- grammarFeedbackJa, vocabularyFeedbackJa, and overallFeedbackJa MUST be in Japanese
- modelSummary should be in English (2-4 sentences)
- score is a number from 0-100 representing the overall quality
- Be encouraging but honest in feedback
- If the summary is good, acknowledge it positively`;
}

type EvaluationResponse = {
  keyPointsCaptured: string[];
  keyPointsMissed: string[];
  grammarFeedbackJa: string;
  vocabularyFeedbackJa: string;
  overallFeedbackJa: string;
  modelSummary: string;
  score: number;
};

export const POST = createReadingApiHandler<EvaluateSummaryRequest, SummaryFeedback>({
  validate: validateEvaluateSummaryRequest,
  errorMessage: 'Failed to evaluate summary. Please try again.',
  handler: async (request) => {
    const prompt = buildEvaluationPrompt(request);
    const parsed = await getJsonCompletion<EvaluationResponse>(prompt, 1500);

    if (
      !Array.isArray(parsed.keyPointsCaptured) ||
      !Array.isArray(parsed.keyPointsMissed) ||
      !parsed.grammarFeedbackJa ||
      !parsed.vocabularyFeedbackJa ||
      !parsed.overallFeedbackJa ||
      !parsed.modelSummary ||
      typeof parsed.score !== 'number'
    ) {
      throw new Error('Invalid response format from AI');
    }

    const score = Math.max(0, Math.min(100, parsed.score));

    return {
      keyPointsCaptured: parsed.keyPointsCaptured,
      keyPointsMissed: parsed.keyPointsMissed,
      grammarFeedbackJa: parsed.grammarFeedbackJa,
      vocabularyFeedbackJa: parsed.vocabularyFeedbackJa,
      overallFeedbackJa: parsed.overallFeedbackJa,
      modelSummary: parsed.modelSummary,
      score,
    };
  },
});
