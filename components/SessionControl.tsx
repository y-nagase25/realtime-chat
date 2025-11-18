'use client';

import { useRef, useState } from 'react';
import { Button } from './ui/button';
import { CloudLightning } from 'lucide-react';

export function SessionControl() {
  const [isActivating, setIsActivating] = useState(false);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  async function startSession() {
    try {
      // Get a session token for OpenAI Realtime API
      const tokenResponse = await fetch('/api/realtime/session', {
        method: 'POST',
      });

      if (!tokenResponse.ok) {
        throw new Error(`Failed to fetch token: ${tokenResponse.statusText}`);
      }

      // EPHEMERAL_KEY
      const { clientSecret } = await tokenResponse.json();

      // Create a peer connection
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      // Set up to play remote audio from the model
      audioElementRef.current = document.createElement('audio');
      audioElementRef.current.autoplay = true;
      pc.ontrack = (e) => {
        audioElementRef.current.srcObject = e.streams[0];
      };

      // Add local audio track for microphone input in the browser
      const ms = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      pc.addTrack(ms.getTracks()[0]);

      // Set up data channel for sending and receiving events
      const dc = pc.createDataChannel('oai-events');
      dataChannelRef.current = dc;

      // Start the session using the Session Description Protocol (SDP)
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // ⭐️ Send offer to OpenAI. get answer
      const baseUrl = 'https://api.openai.com/v1/realtime';
      //   const model = 'gpt-realtime';
      const sdpResponse = await fetch(baseUrl, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${clientSecret}`,
          'Content-Type': 'application/sdp',
        },
      });
      if (!sdpResponse.ok) {
        throw new Error(`Failed to connect to OpenAI: ${sdpResponse.statusText}`);
      }

      const answer = {
        type: 'answer' as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      await pc.setRemoteDescription(answer);
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  function handleStartSession() {
    if (isActivating) return;

    setIsActivating(true);
    startSession();
  }
  return (
    <div className="flex gap-4 border-t-2 border-gray-200 h-full rounded-md">
      {/* <Button>Session Active</Button> */}
      <div className="flex items-center justify-center w-full h-full">
        <Button
          onClick={handleStartSession}
          className={isActivating ? 'bg-gray-600' : 'bg-red-600'}
        >
          <CloudLightning height={16} />
          {isActivating ? 'starting session...' : 'start session'}
        </Button>
      </div>
    </div>
  );
}
