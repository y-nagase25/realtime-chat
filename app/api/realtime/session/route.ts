import { NextResponse } from 'next/server';

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
  } catch (err) {
    console.error(err instanceof Error ? err.message : 'unknown error');
    return NextResponse.json({
      message: 'failed to generate ephemeral key.',
    });
  }
}
