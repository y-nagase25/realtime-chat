import { NextResponse } from 'next/server';

export async function POST() {
  // OpenAI APIにEphemeral Token要求
  const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-realtime-preview',
      voice: 'alloy',
    }),
  });

  const data = await response.json();

  // client_secret (Ephemeral Token) を返す
  return NextResponse.json({
    clientSecret: data.client_secret.value,
    expiresAt: data.client_secret.expires_at,
  });
}
