/**
 * SpeakingPractice Container Component
 * Orchestrates the complete speaking practice scoring flow
 */

'use client';

import { useCallback } from 'react';
import type { Question } from '@/lib/types/db';
import { useSpeakingScoring } from '@/lib/hooks/use-speaking-scoring';
import { useAttemptHistory } from '@/lib/hooks/use-attempt-history';
import { AudioRecorder } from './AudioRecorder';
import { TranscriptDisplay } from './TranscriptDisplay';
import { ScoringResults } from './ScoringResults';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircleIcon } from 'lucide-react';

interface SpeakingPracticeProps {
  question: Question;
}

export function SpeakingPractice({ question }: SpeakingPracticeProps) {
  const { addAttempt } = useAttemptHistory();

  const { state, transcript, scoringResult, error, transcribeAudio, requestScoring, reset } =
    useSpeakingScoring({
      questionId: question.id ?? 0,
      questionText: question.question,
      modelAnswer: question.answer,
    });

  // Handle recording completion
  const handleRecordingComplete = useCallback(
    async (audioBlob: Blob) => {
      await transcribeAudio(audioBlob);
    },
    [transcribeAudio]
  );

  // Handle score request
  const handleScoreRequest = useCallback(async () => {
    if (!transcript) return;

    await requestScoring(transcript);
  }, [transcript, requestScoring]);

  // Save attempt when scoring is complete
  const handleSaveAttempt = useCallback(() => {
    if (scoringResult && transcript) {
      addAttempt({
        question_id: question.id ?? 0,
        transcript,
        score: scoringResult.score,
        areas_for_improvement: scoringResult.areasForImprovement,
        good_points: scoringResult.goodPoints,
        processing_time_ms: scoringResult.processingTime,
      });
    }
  }, [scoringResult, transcript, question.id, addAttempt]);

  // Save and reset for new attempt
  const handleTryAgain = useCallback(() => {
    handleSaveAttempt();
    reset();
  }, [handleSaveAttempt, reset]);

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && state === 'error' && (
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium">Error: {error}</div>
            <Button variant="outline" size="sm" className="mt-2" onClick={reset}>
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Recording Phase */}
      {(state === 'idle' || state === 'recording') && (
        <AudioRecorder onRecordingComplete={handleRecordingComplete} disabled={state !== 'idle'} />
      )}

      {/* Transcribing Phase */}
      {state === 'transcribing' && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Spinner className="mx-auto mb-4 h-8 w-8" />
            <p className="text-sm text-muted-foreground">Transcribing your response...</p>
          </div>
        </div>
      )}

      {/* Transcript Display Phase */}
      {(state === 'transcribed' || state === 'scoring') && transcript && (
        <TranscriptDisplay
          transcript={transcript}
          onScore={handleScoreRequest}
          isScoring={state === 'scoring'}
          canScore={state === 'transcribed'}
        />
      )}

      {/* Results Display Phase */}
      {state === 'completed' && scoringResult && transcript && (
        <div className="space-y-4">
          <ScoringResults result={scoringResult} transcript={transcript} />

          {/* Try Again Button */}
          <Button variant="outline" onClick={handleTryAgain} className="w-full">
            Try Another Question
          </Button>
        </div>
      )}
    </div>
  );
}
