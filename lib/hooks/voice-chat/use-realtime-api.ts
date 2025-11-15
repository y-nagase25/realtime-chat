import { useCallback, useEffect, useRef, useState } from 'react';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

interface UseRealtimeAPIOptions {
  apiKey: string;
  onTranscriptReceived: (speaker: 'user' | 'assistant', text: string) => void;
  onAudioReceived: (audioData: ArrayBuffer) => void;
  onError: (error: Error) => void;
}

interface UseRealtimeAPIReturn {
  isConnected: boolean;
  connectionState: ConnectionState;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendAudio: (audioData: ArrayBuffer) => void;
  interrupt: () => void;
}

const REALTIME_API_URL = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01';
const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1000; // 1 second

export function useRealtimeAPI({
  apiKey,
  onTranscriptReceived,
  onAudioReceived,
  onError,
}: UseRealtimeAPIOptions): UseRealtimeAPIReturn {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManualDisconnectRef = useRef(false);

  // Calculate exponential backoff delay
  const getReconnectDelay = useCallback(() => {
    return Math.min(
      INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current),
      30000 // Max 30 seconds
    );
  }, []);

  // Handle incoming WebSocket messages
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case 'conversation.item.created':
            // Handle user transcript
            if (message.item?.role === 'user' && message.item?.content) {
              const transcript = message.item.content
                .filter((c: any) => c.type === 'input_text')
                .map((c: any) => c.text)
                .join('');
              if (transcript) {
                onTranscriptReceived('user', transcript);
              }
            }
            break;

          case 'response.audio_transcript.delta':
            // Handle assistant transcript delta
            if (message.delta) {
              onTranscriptReceived('assistant', message.delta);
            }
            break;

          case 'response.audio.delta':
            // Handle audio data
            if (message.delta) {
              // Decode base64 audio to ArrayBuffer
              const binaryString = atob(message.delta);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              onAudioReceived(bytes.buffer);
            }
            break;

          case 'error':
            onError(new Error(message.error?.message || 'Unknown API error'));
            break;
        }
      } catch (error) {
        onError(error instanceof Error ? error : new Error('Failed to parse message'));
      }
    },
    [onTranscriptReceived, onAudioReceived, onError]
  );

  // Attempt reconnection with exponential backoff
  const attemptReconnect = useCallback(() => {
    if (isManualDisconnectRef.current || reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      setConnectionState('error');
      onError(new Error('Maximum reconnection attempts reached'));
      return;
    }

    const delay = getReconnectDelay();
    reconnectAttemptsRef.current += 1;

    reconnectTimeoutRef.current = setTimeout(() => {
      if (!isManualDisconnectRef.current) {
        connect();
      }
    }, delay);
  }, [getReconnectDelay, onError]);

  // Connect to WebSocket
  const connect = useCallback(async () => {
    // Validate API key format
    if (!apiKey || !apiKey.startsWith('sk-')) {
      const error = new Error('Invalid API key format. API key must start with "sk-"');
      onError(error);
      setConnectionState('error');
      throw error;
    }

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    isManualDisconnectRef.current = false;
    setConnectionState('connecting');

    try {
      // Create WebSocket connection with API key as Bearer token
      const ws = new WebSocket(REALTIME_API_URL, [
        'realtime',
        `openai-insecure-api-key.${apiKey}`,
      ]);

      wsRef.current = ws;

      // Handle connection open
      ws.addEventListener('open', () => {
        setConnectionState('connected');
        reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection

        // Send session.update message with model configuration
        const sessionConfig = {
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: 'You are a helpful AI assistant. Respond naturally to user queries.',
            voice: 'alloy',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1',
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500,
            },
          },
        };

        ws.send(JSON.stringify(sessionConfig));
      });

      // Handle incoming messages
      ws.addEventListener('message', handleMessage);

      // Handle connection close
      ws.addEventListener('close', (event) => {
        wsRef.current = null;
        
        if (!isManualDisconnectRef.current) {
          setConnectionState('disconnected');
          // Attempt reconnection if not manually disconnected
          attemptReconnect();
        } else {
          setConnectionState('disconnected');
        }
      });

      // Handle connection error
      ws.addEventListener('error', (event) => {
        const error = new Error('WebSocket connection error');
        onError(error);
        setConnectionState('error');
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to connect');
      onError(err);
      setConnectionState('error');
      throw err;
    }
  }, [apiKey, onError, handleMessage, attemptReconnect]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    isManualDisconnectRef.current = true;
    
    // Clear any pending reconnection attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Close WebSocket connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setConnectionState('disconnected');
    reconnectAttemptsRef.current = 0;
  }, []);

  // Send audio data to API
  const sendAudio = useCallback((audioData: ArrayBuffer) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Convert ArrayBuffer to base64
      const bytes = new Uint8Array(audioData);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64Audio = btoa(binary);

      // Send audio append message
      const message = {
        type: 'input_audio_buffer.append',
        audio: base64Audio,
      };

      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  // Send interruption signal
  const interrupt = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'response.cancel',
      };

      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected: connectionState === 'connected',
    connectionState,
    connect,
    disconnect,
    sendAudio,
    interrupt,
  };
}
