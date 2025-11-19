'use client';

import { useRef, useState } from 'react';
import { SessionStopped } from './SessionStopped';
import { SessionActive } from './SessionActive';

export function SessionControl() {
  const [isActivating, setIsActivating] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);

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
        if (audioElementRef.current) {
          audioElementRef.current.srcObject = e.streams[0];
        }
      };

      // Add local audio track for microphone input in the browser
      const ms = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      pc.addTrack(ms.getTracks()[0]);

      // Set up data channel for sending and receiving events
      const dc = pc.createDataChannel('oai-events');
      dataChannelRef.current = dc;

      // Attach event listeners to the data channel
      dc.addEventListener('open', () => {
        setIsSessionActive(true);
        setIsActivating(false);
      });

      dc.addEventListener('close', () => {
        setIsSessionActive(false);
      });

      dc.addEventListener('error', (error) => {
        console.error('Data channel error:', error);
        setIsSessionActive(false);
        setIsActivating(false);
      });

      // Start the session using the Session Description Protocol (SDP)
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // ⭐️ Send offer to OpenAI. get answer
      const baseUrl = 'https://api.openai.com/v1/realtime/calls';
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
      setIsActivating(false);
      setIsSessionActive(false);
    }
  }

  function stopSession() {
    // Stop current session, clean up peer connection and data channel
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
    }

    peerConnectionRef.current?.getSenders().forEach((sender) => {
      if (sender.track) {
        sender.track.stop();
      }
    });

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.srcObject = null;
    }

    dataChannelRef.current = null;
    peerConnectionRef.current = null;
    audioElementRef.current = null;
    setIsActivating(false);
    setIsSessionActive(false);
  }

  return (
    <div className="flex gap-4 border-t-2 border-gray-200 h-full rounded-md">
      {isSessionActive ? (
        <SessionActive stopSession={stopSession} />
      ) : (
        <SessionStopped
          isActivating={isActivating}
          setIsActivating={setIsActivating}
          startSession={startSession}
        />
      )}
    </div>
  );
}
