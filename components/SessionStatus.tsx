'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useState } from 'react';

export default function SessionStatus() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const getStatusBadgeVariant = () => {
    if (isConnecting) return 'default';
    if (isAudioPlaying) return 'default';
    return 'destructive';
  };

  const getStatusLabel = () => {
    if (isConnecting) return 'Connecting...';
    if (isAudioPlaying) return 'Connected';
    return 'Disconnected';
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">Connection Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge variant={getStatusBadgeVariant()}>
              {isConnecting && <Spinner className="mr-2 h-3 w-3" />}
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

          {isAudioPlaying && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Audio:</span>
              <Badge variant="default">
                <Spinner className="mr-2 h-3 w-3" />
                AI is speaking...
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
