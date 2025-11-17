'use client';

import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Mic, Square } from 'lucide-react';
import { useRecording } from '@/lib/hooks/transcript/use-recording';

export function RecordingControls() {
  const { isRecording, isTranscribing, canRecord, startRecording, stopRecording } = useRecording();

  return (
    <Card className="mb-8 p-8">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <Button
            size="lg"
            variant={isRecording ? 'destructive' : 'default'}
            disabled={!canRecord}
            onClick={isRecording ? stopRecording : startRecording}
            className="size-24 rounded-full"
          >
            {isRecording ? (
              <Square className="size-10 fill-current" />
            ) : (
              <Mic className="size-10" />
            )}
          </Button>
        </div>
        <div className="text-center">
          {isRecording && (
            <>
              <div className="mb-2 text-3xl font-bold tabular-nums">
                {/* {formatTime(recordingTime)} */}
              </div>
              <p className="text-sm text-muted-foreground">Recording in progress...</p>
            </>
          )}
          {isTranscribing && (
            <div className="flex items-center gap-2">
              <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Transcribing audio...</p>
            </div>
          )}
          {!isRecording && !isTranscribing && (
            <p className="text-sm text-muted-foreground">
              {canRecord
                ? 'Click the button to start recording'
                : 'Grant microphone permission to start'}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
