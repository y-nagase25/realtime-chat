import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST() {
  const client = new OpenAI();
  const response = await client.responses.create({
    model: 'gpt-4o-mini',
    input: 'Write a short bedtime story about a unicorn.',
  });
  console.log(response.output_text);
}
