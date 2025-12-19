import { env } from '@/lib/environment';
import { audioModel, openai } from '@/lib/openai';
import { checkUsageLimit } from '@/lib/usage-check';
import { trackAudioTranscription } from '@/lib/utils/track-usage';
import { type NextRequest, NextResponse } from 'next/server';
import type { Transcription } from 'openai/resources/audio';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = (formData.get('file') || formData.get('audio')) as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Check usage limit
    const limitData = await checkUsageLimit(request);
    if (limitData.exceeded) {
      return NextResponse.json({ error: 'Daily usage limit exceeded' }, { status: 403 });
    }

    // Transcribe audio with OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      model: audioModel,
      file: audioFile,
      language: 'en',
      response_format: 'json',
      temperature: 0.1,
    });
    if (env.isDevelopment) console.log(transcription);

    const usage = transcription.usage as Transcription.Duration;
    if (usage) trackAudioTranscription(audioModel, usage.seconds);

    return NextResponse.json({
      transcription: transcription,
      success: true,
    });
  } catch (err) {
    console.error(err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}
