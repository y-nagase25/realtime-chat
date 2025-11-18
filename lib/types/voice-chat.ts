// Message model for conversation transcripts
export interface Message {
  id: string; // UUID
  speaker: 'user' | 'assistant';
  text: string; // Transcript text
  timestamp: number; // Unix timestamp
}

// API configuration
export interface ApiConfig {
  apiKey: string;
  endpoint: string; // Default: wss://api.openai.com/v1/realtime
  model: string; // Default: gpt-4o-realtime-preview-2024-10-01
}

// Connection state types
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface ConnectionStatus {
  state: ConnectionState;
  error?: string;
}

// WebSocket message types - Outgoing
export interface AudioMessage {
  type: 'input_audio_buffer.append';
  audio: string; // base64 encoded PCM16 audio
}

export interface CommitMessage {
  type: 'input_audio_buffer.commit';
}

export interface SessionUpdateMessage {
  type: 'session.update';
  session: {
    modalities: string[];
    instructions: string;
    voice: string;
    input_audio_format: string;
    output_audio_format: string;
    turn_detection: {
      type: string;
      threshold: number;
      prefix_padding_ms: number;
      silence_duration_ms: number;
    } | null;
  };
}

export interface ResponseCancelMessage {
  type: 'response.cancel';
}

// WebSocket message types - Incoming
export interface TranscriptMessage {
  type:
    | 'conversation.item.created'
    | 'response.audio_transcript.delta'
    | 'response.audio_transcript.done';
  item?: {
    role: 'user' | 'assistant';
    content?: Array<{
      type: string;
      transcript?: string;
    }>;
  };
  transcript?: string;
  delta?: string;
}

export interface AudioResponseMessage {
  type: 'response.audio.delta' | 'response.audio.done';
  delta?: string; // base64 encoded PCM16 audio
}

export interface ErrorMessage {
  type: 'error';
  error: {
    type: string;
    code: string;
    message: string;
  };
}

export type WebSocketMessage =
  | AudioMessage
  | CommitMessage
  | SessionUpdateMessage
  | ResponseCancelMessage
  | TranscriptMessage
  | AudioResponseMessage
  | ErrorMessage;
