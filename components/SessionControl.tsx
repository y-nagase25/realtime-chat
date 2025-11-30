'use client';

import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Spinner } from './ui/spinner';
import { useRealtimeSession } from '@/lib/hooks/use-realtime-session';
import { Badge } from './ui/badge';
import { AudioLines, Pause } from 'lucide-react';

export function SessionControl() {
  const {
    isActivating,
    isSessionActive,
    hasMicPermission,
    handleStartSession,
    stopSession,
    getStatusLabel,
  } = useRealtimeSession();

  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant="outline">
                {isActivating && <Spinner className="mr-2 h-3 w-3" />}
                {getStatusLabel()}
              </Badge>
            </div>

            {hasMicPermission !== null && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Microphone:</span>
                <Badge variant={hasMicPermission ? 'default' : 'destructive'}>
                  {hasMicPermission ? 'Granted' : 'Denied'}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {isSessionActive ? (
        <Button variant="destructive" onClick={stopSession}>
          <Pause className="mr-2 h-5 w-5" />
          Disconnect
        </Button>
      ) : (
        <Button onClick={handleStartSession} disabled={isActivating}>
          {isActivating ? (
            <Spinner className="mr-2 h-5 w-5" />
          ) : (
            <AudioLines className="mr-2 h-5 w-5" />
          )}
          Start Conversation
        </Button>
      )}
    </>
  );
}
