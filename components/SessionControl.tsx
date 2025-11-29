'use client';

import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Spinner } from './ui/spinner';
import { useRealtimeSession } from '@/lib/hooks/use-realtime-session';
import { Badge } from './ui/badge';

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
          <CardTitle className="text-lg">Connection Status</CardTitle>
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
          Disconnect
        </Button>
      ) : (
        <Button onClick={handleStartSession} disabled={isActivating}>
          {isActivating && <Spinner className="mr-2 h-4 w-4" />}
          Start Conversation
        </Button>
      )}
    </>
  );
}
