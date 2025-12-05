import { NextResponse } from 'next/server';
import { env } from '@/lib/environment';

type SessionResponseType = {
  value: string;
  expires_at: number;
  session: {
    type: string;
    object: string;
    id: string;
    model: string;
  };
};

export async function POST() {
  // https://platform.openai.com/docs/api-reference/realtime-sessions/create-realtime-client-secret
  const url = 'https://api.openai.com/v1/realtime/client_secrets';
  const sessionConfig = JSON.stringify({
    expires_after: {
      anchor: 'created_at',
      seconds: 600,
    },
    session: {
      type: 'realtime',
      model: 'gpt-realtime-mini',
      instructions: 'You are a English teacher.',
      audio: {
        output: {
          voice: 'marin',
        },
      },
    },
  });

  try {
    if (env.isProduction) throw new Error('This API is not available in production.');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: sessionConfig,
    });
    const data: SessionResponseType = await response.json();

    // client_secret (Ephemeral Key)
    return NextResponse.json({
      clientSecret: data.value,
      expiresAt: data.expires_at,
      session: data.session,
    });
  } catch (error) {
    console.error('[RealtimeSession] Error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json({ error: 'Failed to generate ephemeral key' }, { status: 500 });
  }
}
