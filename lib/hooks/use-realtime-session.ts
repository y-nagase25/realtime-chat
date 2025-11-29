import { useRef, useState } from 'react';

type ConnectionState =
  | 'idle'
  | 'fetching-token'
  | 'creating-peer'
  | 'requesting-mic'
  | 'creating-offer'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'disconnected';

export interface UseRealtimeSessionReturn {
  isActivating: boolean;
  isSessionActive: boolean;
  connectionState: ConnectionState;
  hasMicPermission: boolean | null;
  startSession: () => Promise<void>;
  stopSession: () => void;
  handleStartSession: () => void;
  getStatusLabel: () => string;
}

export function useRealtimeSession(): UseRealtimeSessionReturn {
  const [isActivating, setIsActivating] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  function getStatusLabel(): string {
    const labels: Record<ConnectionState, string> = {
      idle: 'Idle',
      'fetching-token': 'Fetching Token...',
      'creating-peer': 'Creating Connection...',
      'requesting-mic': 'Requesting Microphone...',
      'creating-offer': 'Creating Offer...',
      connecting: 'Connecting...',
      connected: 'Connected',
      error: 'Error',
      disconnected: 'Disconnected',
    };
    return labels[connectionState];
  }

  async function startSession() {
    try {
      // Get a session token for OpenAI Realtime API
      setConnectionState('fetching-token');
      const tokenResponse = await fetch('/api/realtime/session', {
        method: 'POST',
      });

      if (!tokenResponse.ok) {
        throw new Error(`Failed to fetch token: ${tokenResponse.statusText}`);
      }

      // EPHEMERAL_KEY
      const { clientSecret } = await tokenResponse.json();

      // Create a peer connection
      setConnectionState('creating-peer');
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
      setConnectionState('requesting-mic');
      const ms = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      setHasMicPermission(true);
      pc.addTrack(ms.getTracks()[0]);

      // Set up data channel for sending and receiving events
      const dc = pc.createDataChannel('oai-events');
      dataChannelRef.current = dc;

      // Attach event listeners to the data channel
      dc.addEventListener('open', () => {
        setConnectionState('connected');
        setIsSessionActive(true);
        setIsActivating(false);
      });

      dc.addEventListener('close', () => {
        setConnectionState('disconnected');
        setIsSessionActive(false);
      });

      dc.addEventListener('error', (error) => {
        console.error('Data channel error:', error);
        setIsSessionActive(false);
        setIsActivating(false);
      });

      // Start the session using the Session Description Protocol (SDP)
      setConnectionState('creating-offer');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // ⭐️ Send offer to OpenAI. get answer
      setConnectionState('connecting');
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
      setConnectionState('error');
      // Microphone permission is denied
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setHasMicPermission(false);
      }

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

    setConnectionState('disconnected');
    dataChannelRef.current = null;
    peerConnectionRef.current = null;
    audioElementRef.current = null;
    setIsActivating(false);
    setIsSessionActive(false);
  }

  function handleStartSession() {
    if (isActivating) return;

    setIsActivating(true);
    startSession();
  }

  return {
    isActivating,
    isSessionActive,
    connectionState,
    hasMicPermission,
    startSession,
    stopSession,
    handleStartSession,
    getStatusLabel,
  };
}
