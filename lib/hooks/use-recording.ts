/**
 * Custom hook for audio recording using MediaRecorder API
 */

'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { createAudioBlob } from '@/lib/utils/audio';
import { RECORDING_MAX_DURATION } from '../constants';

export interface UseRecordingReturn {
  isRecording: boolean;
  audioLevel: number;
  duration: number;
  audioBlob: Blob | null;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetRecording: () => void;
}

export interface UseRecordingOptions {
  maxDuration?: number;
}

export function useRecording(options?: UseRecordingOptions): UseRecordingReturn {
  const maxDuration = options?.maxDuration ?? RECORDING_MAX_DURATION;
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Update duration timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setDuration(elapsed);

        // Auto-stop when max duration is reached
        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, maxDuration, stopRecording]);

  const startRecording = useCallback(async () => {
    setError(null);
    setAudioBlob(null);
    setDuration(0);

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;

      // Create MediaRecorder with optimized settings
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000, // 128kbps for good quality
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Collect audio data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = async () => {
        const blob = await createAudioBlob(audioChunksRef.current);
        setAudioBlob(blob);

        // Cleanup stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => {
            track.stop();
          });
          streamRef.current = null;
        }
      };

      // Handle errors
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording error occurred');
        setIsRecording(false);
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      startTimeRef.current = Date.now();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access microphone';

      // Check for specific permission error
      const PERMISSION_DENIED = [
        'Permission denied',
        'NotAllowedError',
        'not allowed',
        'denied permission',
      ];
      if (PERMISSION_DENIED.some((message) => errorMessage.includes(message))) {
        setError('マイクへのアクセス権限が許可されていません。ブラウザの設定をご確認ください。');
      } else {
        setError(errorMessage);
      }
    }
  }, []);

  const resetRecording = useCallback(() => {
    setAudioBlob(null);
    setError(null);
    setDuration(0);
    setAudioLevel(0);
    audioChunksRef.current = [];
  }, []);

  return {
    isRecording,
    audioLevel,
    duration,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    resetRecording,
  };
}
