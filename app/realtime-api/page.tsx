'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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

interface EventLog {
  type: string;
  timestamp: number;
  data?: string;
}

export default function RealtimeApiPage() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [error, setError] = useState<string>('');
  const [events, setEvents] = useState<EventLog[]>([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [audioBlocked, setAudioBlocked] = useState(false);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const eventLogRef = useRef<HTMLDivElement>(null);

  const addEvent = (type: string, data?: string) => {
    const newEvent: EventLog = {
      type,
      timestamp: Date.now(),
      data,
    };
    setEvents((prev) => [...prev.slice(-49), newEvent]);
  };

  const initConnection = async () => {
    setError('');
    setEvents([]);

    try {
      // 1. サーバーからEphemeral Token取得
      setConnectionState('fetching-token');
      addEvent('status', 'Fetching ephemeral token...');

      const tokenRes = await fetch('/api/realtime/session', {
        method: 'POST',
      });

      if (!tokenRes.ok) {
        throw new Error(`Failed to fetch token: ${tokenRes.statusText}`);
      }

      const { clientSecret } = await tokenRes.json();
      addEvent('token.received', 'Ephemeral token received');

      // 2. RTCPeerConnection作成
      setConnectionState('creating-peer');
      addEvent('status', 'Creating peer connection...');

      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      // WebRTC connection state監視
      pc.onconnectionstatechange = () => {
        addEvent('rtc.connectionstatechange', pc.connectionState);
        if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          setConnectionState('disconnected');
        }
      };

      pc.oniceconnectionstatechange = () => {
        addEvent('rtc.iceconnectionstatechange', pc.iceConnectionState);
      };

      // 3. マイク取得 & トラック追加
      setConnectionState('requesting-mic');
      addEvent('status', 'Requesting microphone access...');

      const ms = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      mediaStreamRef.current = ms;
      setHasMicPermission(true);
      addEvent('microphone.granted', 'Microphone access granted');

      pc.addTrack(ms.getTracks()[0]);
      addEvent('rtc.track.added', 'Audio track added to peer connection');

      // 4. DataChannel作成 (イベント送受信用)
      addEvent('status', 'Creating data channel...');
      const dc = pc.createDataChannel('oai-events');
      dataChannelRef.current = dc;

      dc.onopen = () => {
        setConnectionState('connected');
        addEvent('datachannel.open', 'DataChannel opened');

        // セッション設定を送信
        const sessionConfig = {
          type: 'session.update',
          session: {
            instructions: 'あなたは英会話の先生です',
            turn_detection: { type: 'server_vad' },
          },
        };
        dc.send(JSON.stringify(sessionConfig));
        addEvent('session.update', 'Session configuration sent');
      };

      dc.onclose = () => {
        addEvent('datachannel.close', 'DataChannel closed');
        setConnectionState('disconnected');
      };

      dc.onerror = () => {
        addEvent('datachannel.error', 'DataChannel error occurred');
        setError('DataChannel error occurred');
      };

      dc.onmessage = (e) => {
        const event = JSON.parse(e.data);
        addEvent(event.type, event.delta ? 'Audio delta received' : undefined);
      };

      // 5. 受信音声の処理
      pc.ontrack = (e) => {
        addEvent('rtc.track.received', 'Audio track received from OpenAI');
        const audio = new Audio();
        audio.srcObject = e.streams[0];
        audioElementRef.current = audio;

        // Add audio element to DOM (hidden) for better browser compatibility
        audio.style.display = 'none';
        document.body.appendChild(audio);

        audio.onplay = () => {
          setIsAudioPlaying(true);
          setAudioBlocked(false);
        };
        audio.onpause = () => setIsAudioPlaying(false);
        audio.onended = () => setIsAudioPlaying(false);

        audio.play().catch((err) => {
          addEvent('audio.error', `Failed to play audio: ${err.message}`);

          // Detect autoplay policy block
          if (err.name === 'NotAllowedError' || err.name === 'NotSupportedError') {
            setAudioBlocked(true);
            addEvent('audio.blocked', 'Audio blocked by browser autoplay policy');
          }
        });
      };

      // 6. SDP Offer作成
      setConnectionState('creating-offer');
      addEvent('status', 'Creating SDP offer...');

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      addEvent('rtc.offer.created', 'SDP offer created and set');

      // 7. OpenAIにOffer送信してAnswer取得
      setConnectionState('connecting');
      addEvent('status', 'Connecting to OpenAI...');

      const sdpRes = await fetch('https://api.openai.com/v1/realtime', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${clientSecret}`,
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp,
      });

      if (!sdpRes.ok) {
        throw new Error(`Failed to connect to OpenAI: ${sdpRes.statusText}`);
      }

      // OpenAIからのアンサーSDPを設定
      const answer = {
        type: 'answer' as RTCSdpType,
        sdp: await sdpRes.text(),
      };
      await pc.setRemoteDescription(answer);
      addEvent('rtc.answer.received', 'SDP answer received and set');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setConnectionState('error');
      addEvent('error', errorMessage);

      // マイク権限エラーの特別処理
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setHasMicPermission(false);
        setError('Microphone access denied. Please grant permission and try again.');
      }

      // クリーンアップ
      disconnect();
    }
  };

  const disconnect = () => {
    addEvent('status', 'Disconnecting...');

    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      mediaStreamRef.current = null;
    }

    if (audioElementRef.current) {
      audioElementRef.current.pause();
      // Remove audio element from DOM
      if (audioElementRef.current.parentNode) {
        audioElementRef.current.parentNode.removeChild(audioElementRef.current);
      }
      audioElementRef.current = null;
    }

    setConnectionState('disconnected');
    setIsAudioPlaying(false);
    setAudioBlocked(false);
    addEvent('status', 'Disconnected');
  };

  const clearEvents = () => {
    setEvents([]);
  };

  const retryAudio = () => {
    if (audioElementRef.current) {
      addEvent('audio.retry', 'Retrying audio playback...');
      audioElementRef.current
        .play()
        .then(() => {
          setAudioBlocked(false);
          addEvent('audio.started', 'Audio playback started successfully');
        })
        .catch((err) => {
          addEvent('audio.error', `Retry failed: ${err.message}`);
          if (err.name === 'NotAllowedError' || err.name === 'NotSupportedError') {
            setAudioBlocked(true);
          }
        });
    }
  };

  // Auto-scroll event log when new events are added
  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to scroll when events change
  useEffect(() => {
    if (eventLogRef.current) {
      eventLogRef.current.scrollTop = eventLogRef.current.scrollHeight;
    }
  }, [events.length]);

  const getStatusBadgeVariant = (): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (connectionState) {
      case 'connected':
        return 'default';
      case 'error':
        return 'destructive';
      case 'disconnected':
      case 'idle':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (): string => {
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
  };

  const isConnecting =
    connectionState !== 'idle' &&
    connectionState !== 'connected' &&
    connectionState !== 'error' &&
    connectionState !== 'disconnected';

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Realtime API (WebRTC)</h1>

      {/* Status Section */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant={getStatusBadgeVariant()}>
                {isConnecting && <Spinner className="mr-2 h-3 w-3" />}
                {getStatusLabel()}
              </Badge>
            </div>

            {hasMicPermission !== null && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Microphone:</span>
                <Badge variant={hasMicPermission ? 'default' : 'destructive'}>
                  {hasMicPermission ? 'Granted' : 'Denied'}
                </Badge>
              </div>
            )}

            {isAudioPlaying && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Audio:</span>
                <Badge variant="default">
                  <Spinner className="mr-2 h-3 w-3" />
                  AI is speaking...
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Audio Blocked Alert */}
      {audioBlocked && (
        <Alert className="mb-4 border-yellow-500 bg-yellow-50">
          <AlertDescription className="flex items-center justify-between">
            <span className="text-yellow-900">
              Audio playback blocked by browser. Click to enable audio.
            </span>
            <Button onClick={retryAudio} size="sm" variant="outline" className="ml-4">
              Enable Audio
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Controls */}
      <div className="flex gap-2 mb-4">
        {connectionState === 'idle' ||
        connectionState === 'error' ||
        connectionState === 'disconnected' ? (
          <Button onClick={initConnection} disabled={isConnecting}>
            {isConnecting && <Spinner className="mr-2 h-4 w-4" />}
            Start Conversation
          </Button>
        ) : (
          <Button onClick={disconnect} variant="destructive" disabled={isConnecting}>
            Disconnect
          </Button>
        )}
        <Button onClick={clearEvents} variant="outline" disabled={events.length === 0}>
          Clear Events
        </Button>
      </div>

      <Separator className="my-4" />

      {/* Event Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Event Log ({events.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={eventLogRef}
            className="h-96 overflow-y-auto border rounded-md p-3 bg-muted/20 font-mono text-xs"
          >
            {events.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No events yet. Start a conversation to see events.
              </div>
            ) : (
              events.map((event) => (
                <div key={`${event.timestamp}-${event.type}`} className="mb-1 flex gap-2">
                  <span className="text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="font-semibold">{event.type}</span>
                  {event.data && <span className="text-muted-foreground">- {event.data}</span>}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
