/**
 * TranscriptDisplay Component
 * Shows transcribed text and Score button
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

interface TranscriptDisplayProps {
  transcript: string;
  onScore: () => void;
  isScoring: boolean;
  canScore: boolean;
}

export function TranscriptDisplay({
  transcript,
  onScore,
  isScoring,
  canScore,
}: TranscriptDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Your Response</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Transcript Text */}
        <div className="rounded-lg bg-muted p-4">
          <p className="leading-relaxed">{transcript}</p>
        </div>

        {/* Score Button */}
        <Button onClick={onScore} disabled={!canScore || isScoring} size="lg" className="w-full">
          {isScoring ? (
            <>
              <Spinner className="mr-2" />
              Evaluating...
            </>
          ) : (
            'Score My Response'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
