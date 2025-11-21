'use client';

import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Mic, Square } from 'lucide-react';
import { useRecording } from '@/lib/hooks/transcript/use-recording';

export function RecordingControls() {
  const { isRecording, isProcessing, startRecording, stopRecording } = useRecording();

  return (
    <Card className="mb-8 p-8">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <Button
            size="lg"
            variant={isRecording ? 'destructive' : 'default'}
            disabled={isProcessing}
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
          {isProcessing && (
            <div className="flex items-center gap-2">
              <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Processing audio...</p>
            </div>
          )}
          {!isRecording && !isProcessing && (
            <p className="text-sm text-muted-foreground">Click the button to start recording</p>
          )}
        </div>
      </div>
    </Card>
  );
}
