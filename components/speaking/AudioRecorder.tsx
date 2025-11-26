/**
 * AudioRecorder Component
 * Handles audio recording with visual feedback
 */

'use client';

import { Button } from '@/components/ui/button';
import { useRecording } from '@/lib/hooks/use-recording';
import { formatDuration } from '@/lib/utils/audio';
import { AudioLines, Pause } from 'lucide-react';
import { useEffect } from 'react';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  disabled: boolean;
}

export function AudioRecorder({ onRecordingComplete, disabled }: AudioRecorderProps) {
  const { isRecording, duration, audioBlob, error, startRecording, stopRecording, resetRecording } =
    useRecording();

  // Call callback when recording is complete
  useEffect(() => {
    if (audioBlob && !isRecording) {
      onRecordingComplete(audioBlob);
      resetRecording();
    }
  }, [audioBlob, isRecording, onRecordingComplete, resetRecording]);

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      <div className="flex items-center gap-4">
        {!isRecording ? (
          <Button onClick={startRecording} disabled={disabled} size="lg" className="w-full">
            <AudioLines className="mr-2 h-5 w-5" />
            Start Recording
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            disabled={disabled}
            variant="destructive"
            size="lg"
            className="w-full"
          >
            <Pause className="mr-2 h-5 w-5" />
            Stop Recording
          </Button>
        )}
      </div>

      {/* Recording Status */}
      {isRecording && (
        <div className="flex items-center justify-between rounded-lg border bg-muted p-4">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
            <span className="text-sm font-medium">Recording...</span>
          </div>
          <div className="font-mono text-sm font-medium">{formatDuration(duration)}</div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}
    </div>
  );
}
