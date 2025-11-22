'use client';

import { useRecording } from '@/lib/hooks/transcript/use-recording';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Question } from '@/lib/types/db';

interface ClientPageProps {
  questions: Question[];
}

export default function ClientPage({ questions }: ClientPageProps) {
  const { isRecording, isProcessing, transcription, error, startRecording, stopRecording, reset } =
    useRecording();

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Ja - En Translation</h1>

      {/* Conversation */}
      {questions.map((question, index) => (
        <Card key={question.id} className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Q{index + 1}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <p className="leading-7">{question.question}</p>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Controls */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">Recording Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={startRecording} disabled={isRecording || isProcessing}>
              Start Recording
            </Button>
            <Button onClick={stopRecording} disabled={!isRecording} variant="destructive">
              Stop Recording
            </Button>
            {transcription && (
              <Button onClick={reset} variant="outline">
                Reset
              </Button>
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

      {/* Processing State */}
      {isProcessing && (
        <Alert className="mb-4">
          <AlertDescription>Processing audio...</AlertDescription>
        </Alert>
      )}

      {/* Transcription Result */}
      {transcription && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transcription Result</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base whitespace-pre-wrap">{transcription}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
