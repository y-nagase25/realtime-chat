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
import { EXCEEDED_USAGE_LIMIT_MSG } from '@/lib/constants';
import { useToast } from '@/lib/hooks/use-toast';

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
 * Main hook for speaking practice scoring
 */
export function useSpeakingScoring(options: UseSpeakingScoringOptions): UseSpeakingScoringReturn {
  const [state, dispatch] = useReducer(speakingReducer, 'idle');
  const [transcript, setTranscript] = useState<string | null>(null);
  const [scoringResult, setScoringResult] = useState<ScoringResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { showToast: showExceededUsageLimitToast } = useToast(EXCEEDED_USAGE_LIMIT_MSG, 'warning');

  /**
   * Transcribe audio using Whisper API
   */
  const transcribeAudio = useCallback(
    async (audioBlob: Blob) => {
      dispatch({ type: 'STOP_RECORDING' });
      setError(null);

      try {
        const formData = new FormData();
        const audioFile = new File([audioBlob], 'recording.webm', {
          type: audioBlob.type || 'audio/webm',
        });
        formData.append('file', audioFile);

        const response = await apiPostFormData<{ transcription?: { text: string }; text?: string }>(
          '/api/transcribe',
          formData
        );

        // Handle response format: { transcription: { text: string } }
        const transcriptText = response.transcription?.text || response.text;

        if (transcriptText) {
          setTranscript(transcriptText);
          dispatch({ type: 'TRANSCRIPTION_SUCCESS', transcript: transcriptText });
        } else {
          throw new Error('No transcript returned');
        }
      } catch (err) {
        let errorMessage = '文字起こしに失敗しました';
        if (err instanceof RateLimitError) {
          showExceededUsageLimitToast();
          errorMessage = EXCEEDED_USAGE_LIMIT_MSG;
        }
        setError(errorMessage);
        dispatch({ type: 'TRANSCRIPTION_ERROR', error: err as Error });
      }
    },
    [showExceededUsageLimitToast]
  );

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

        const response = await apiPost<ScoringResponse>('/api/speaking/score', requestBody);

        if (response.success && response.data) {
          setScoringResult(response.data);
          dispatch({ type: 'SCORING_SUCCESS', result: response.data });
        } else {
          throw new Error(response.error || 'Scoring failed');
        }
      } catch (err) {
        let errorMessage = '採点に失敗しました';
        if (err instanceof RateLimitError) {
          showExceededUsageLimitToast();
          errorMessage = EXCEEDED_USAGE_LIMIT_MSG;
        }
        setError(errorMessage);
        dispatch({ type: 'SCORING_ERROR', error: err as Error });
      }
    },
    [options, showExceededUsageLimitToast]
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
