'use client';

import { Button } from './ui/button';
import { Spinner } from './ui/spinner';
import { useRealtimeSession } from '@/lib/hooks/use-realtime-session';

export function SessionControl() {
  const { isActivating, isSessionActive, handleStartSession, stopSession } = useRealtimeSession();

  return (
    <div className="flex gap-4 h-full rounded-md">
      {isSessionActive ? (
        <Button variant="destructive" onClick={stopSession}>
          Disconnect
        </Button>
      ) : (
        <Button onClick={handleStartSession} disabled={isActivating}>
          {isActivating && <Spinner className="mr-2 h-4 w-4" />}
          Start Conversation
        </Button>
      )}
    </div>
  );
}
