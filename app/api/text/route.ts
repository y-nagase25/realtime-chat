import { openai, textModel } from '@/lib/openai';
import { trackTextGeneration } from '@/lib/utils/track-usage';
import { NextResponse } from 'next/server';
import type { ResponseUsage } from 'openai/resources/responses/responses';

export async function POST() {
  const response = await openai.responses.create({
    model: textModel,
    input: 'Reply with only one word: name a animal',
  });

  console.log('Response ID:', response.id);
  console.log('Model:', response.model);
  console.log('Output:', response.output_text);
  console.log('Token:', response.usage);

  if (response.usage) {
    trackTextGeneration(textModel, response.usage).catch(() => {
      // Errors already logged internally
    });
  }

  return NextResponse.json({
    output: response.output,
  });
}

// https://openai.com/ja-JP/api/pricing/
const PRICING = {
  'gpt-5': {
    input: 1.25 / 1_000_000, // $1.25 per 1M tokens
    cached: 0.125 / 1_000_000, // (90%割引)
    output: 10.0 / 1_000_000, // $10.00 per 1M tokens
  },
  'gpt-5-mini': {
    input: 0.25 / 1_000_000, // $0.25 per 1M tokens
    cached: 0.025 / 1_000_000, // (90%割引)
    output: 2.0 / 1_000_000, // $2.00 per 1M tokens
  },
  'gpt-5-nano': {
    input: 0.05 / 1_000_000, // $0.05 per 1M tokens
    cached: 0.005 / 1_000_000, // (90%割引)
    output: 0.4 / 1_000_000, // $0.40 per 1M tokens
  },
};

function calculateCost(
  usage: ResponseUsage | undefined,
  model: 'gpt-5' | 'gpt-5-mini' | 'gpt-5-nano'
) {
  if (!usage) return null;

  const pricing = PRICING[model];
  if (!pricing) return null;

  const inputCost = usage.input_tokens * pricing.input;
  const outputCost = usage.output_tokens * pricing.output;
  const totalCost = inputCost + outputCost;

  return {
    inputCost: `$${inputCost.toFixed(6)}`,
    outputCost: `$${outputCost.toFixed(6)}`,
    totalCost: `$${totalCost.toFixed(6)}`,
  };
}
