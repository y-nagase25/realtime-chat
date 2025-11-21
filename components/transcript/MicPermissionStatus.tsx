'use client';

import { useState } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function MicPermissionStatus() {
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  async function onRequestPermission() {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionState('granted');
    } catch (_err) {
      setPermissionState('denied');
    }
  }

  if (permissionState === 'granted') {
    return (
      <Alert className="mb-6">
        <Mic className="size-4" />
        <AlertDescription>Microphone access granted</AlertDescription>
      </Alert>
    );
  }

  if (permissionState === 'denied') {
    return (
      <Alert variant="destructive" className="mb-6">
        <MicOff className="size-4" />
        <AlertDescription>
          Microphone access denied. Please enable it in your browser settings.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-6">
      <AlertCircle className="size-4" />
      <AlertDescription className="flex items-center justify-between gap-4">
        <span>Microphone permission required to record</span>
        <Button onClick={onRequestPermission} size="sm" className="shrink-0">
          Grant Permission
        </Button>
      </AlertDescription>
    </Alert>
  );
}
