import { audioModel, openai } from '@/lib/openai';
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

    const transcription = await openai.audio.transcriptions.create({
      model: audioModel,
      file: audioFile,
      language: 'en',
      response_format: 'json',
      temperature: 0.1,
    });

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
