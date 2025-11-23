/**
 * Main hook for orchestrating speaking practice scoring flow
 */

'use client';

import { useState, useCallback, useReducer } from 'react';
import type {
  SpeakingState,
  SpeakingEvent,
  ScoringResult,
  ScoringRequest,
  ScoringResponse,
} from '@/lib/types/speaking';

export interface UseSpeakingScoringOptions {
  questionId: number;
  questionText: string;
  modelAnswer: string;
}

export interface UseSpeakingScoringReturn {
  state: SpeakingState;
  transcript: string | null;
  scoringResult: ScoringResult | null;
  error: string | null;
  transcribeAudio: (audioBlob: Blob) => Promise<void>;
  requestScoring: (transcript: string) => Promise<void>;
  reset: () => void;
}

/**
 * State machine reducer
 */
function speakingReducer(state: SpeakingState, event: SpeakingEvent): SpeakingState {
  switch (state) {
    case 'idle':
      if (event.type === 'START_RECORDING') return 'recording';
      break;
    case 'recording':
      if (event.type === 'STOP_RECORDING') return 'transcribing';
      break;
    case 'transcribing':
      if (event.type === 'TRANSCRIPTION_SUCCESS') return 'transcribed';
      if (event.type === 'TRANSCRIPTION_ERROR') return 'error';
      break;
    case 'transcribed':
      if (event.type === 'REQUEST_SCORING') return 'scoring';
      if (event.type === 'RESET') return 'idle';
      break;
    case 'scoring':
      if (event.type === 'SCORING_SUCCESS') return 'completed';
      if (event.type === 'SCORING_ERROR') return 'error';
      break;
    case 'completed':
      if (event.type === 'RESET') return 'idle';
      break;
    case 'error':
      if (event.type === 'RESET') return 'idle';
      break;
  }

  return state;
}

/**
 * Retry helper with exponential backoff
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries: number = 3): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on validation errors
      if (error instanceof Error && error.message.includes('Invalid')) {
        throw error;
      }

      // Exponential backoff
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2 ** i * 1000));
      }
    }
  }

  throw lastError!;
}

/**
 * Main hook for speaking practice scoring
 */
export function useSpeakingScoring(options: UseSpeakingScoringOptions): UseSpeakingScoringReturn {
  const [state, dispatch] = useReducer(speakingReducer, 'idle');
  const [transcript, setTranscript] = useState<string | null>(null);
  const [scoringResult, setScoringResult] = useState<ScoringResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Transcribe audio using Whisper API
   */
  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    dispatch({ type: 'STOP_RECORDING' });
    setError(null);

    try {
      const formData = new FormData();
      const audioFile = new File([audioBlob], 'recording.webm', {
        type: audioBlob.type || 'audio/webm',
      });
      formData.append('file', audioFile);

      const response = await withRetry(async () => {
        const res = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          throw new Error('Transcription request failed');
        }

        return res.json();
      });

      // Handle response format: { transcription: { text: string } }
      const transcriptText = response.transcription?.text || response.text;

      if (transcriptText) {
        setTranscript(transcriptText);
        dispatch({ type: 'TRANSCRIPTION_SUCCESS', transcript: transcriptText });
      } else {
        throw new Error('No transcript returned');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transcription failed';
      setError(errorMessage);
      dispatch({ type: 'TRANSCRIPTION_ERROR', error: err as Error });
    }
  }, []);

  /**
   * Request scoring from GPT-4o API
   */
  const requestScoring = useCallback(
    async (userTranscript: string) => {
      dispatch({ type: 'REQUEST_SCORING' });
      setError(null);

      try {
        const requestBody: ScoringRequest = {
          questionId: options.questionId,
          questionText: options.questionText,
          modelAnswer: options.modelAnswer,
          userTranscript,
        };

        const response = await withRetry(async () => {
          const res = await fetch('/api/speaking/score', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          if (!res.ok) {
            throw new Error('Scoring request failed');
          }

          return res.json() as Promise<ScoringResponse>;
        });

        if (response.success && response.data) {
          setScoringResult(response.data);
          dispatch({ type: 'SCORING_SUCCESS', result: response.data });
        } else {
          throw new Error(response.error || 'Scoring failed');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Scoring failed';
        setError(errorMessage);
        dispatch({ type: 'SCORING_ERROR', error: err as Error });
      }
    },
    [options]
  );

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    setTranscript(null);
    setScoringResult(null);
    setError(null);
    dispatch({ type: 'RESET' });
  }, []);

  return {
    state,
    transcript,
    scoringResult,
    error,
    transcribeAudio,
    requestScoring,
    reset,
  };
}
