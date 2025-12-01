import OpenAI, { type Uploadable } from 'openai';
import type { AudioModel, ChatModel } from 'openai/resources';
import fs from 'node:fs';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: false,
});

export const textModel: ChatModel = 'gpt-5-mini';
export const audioModel: AudioModel = 'whisper-1';

// Whisper cost calculator
export function calculateWhisperCost(durationInSeconds: number): number {
  const pricePerMinute = 0.006;
  const durationInMinutes = durationInSeconds / 60;
  return durationInMinutes * pricePerMinute;
}

// Whisper Mock
export function getAudioMock(file: string = 'hello.mp3'): Uploadable {
  const audioBuffer = fs.readFileSync(`./public/${file}`);
  return new File([audioBuffer], file, { type: 'audio/mp3' });
}
