import { audioModel, openai } from '@/lib/openai';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

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

    return NextResponse.json({
      transcription: transcription,
      success: true,
    });
  } catch (err) {
    console.error(err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}
