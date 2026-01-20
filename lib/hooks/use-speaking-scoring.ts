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
import { apiPost, apiPostFormData } from '@/lib/api-client';
import { RateLimitError } from '@/lib/errors';
import { toast } from 'sonner';
import { EXCEEDED_USAGE_LIMIT_MSG } from '../costants';

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
  if (process.env.NODE_ENV === 'development') {
    console.log('[Speaking] State transition:', { from: state, event: event.type });
  }

  switch (state) {
    case 'idle':
      if (event.type === 'START_RECORDING') return 'recording';
      if (event.type === 'STOP_RECORDING') return 'transcribing'; // Allow direct transition when recording managed by AudioRecorder
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
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const err = error as Error;

      // Don't retry on validation errors
      if (err.message.includes('Invalid')) {
        throw err;
      }

      // last attempt
      if (i === maxRetries - 1) {
        throw err;
      }

      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, 2 ** i * 1000));
    }
  }

  throw new Error('Unexpected state: retry loop completed without result');
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
        try {
          return await apiPostFormData<{ transcription?: { text: string }; text?: string }>(
            '/api/transcribe',
            formData
          );
        } catch (err) {
          if (err instanceof RateLimitError) {
            toast.warning(EXCEEDED_USAGE_LIMIT_MSG);
            throw new Error(EXCEEDED_USAGE_LIMIT_MSG);
          }
          throw err;
        }
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
          return await apiPost<ScoringResponse>('/api/speaking/score', requestBody);
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
