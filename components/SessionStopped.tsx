'use client';

import { CloudLightning } from 'lucide-react';
import { Button } from './ui/button';

type SessionStoppedProps = {
  isActivating: boolean;
  setIsActivating: (isActivating: boolean) => void;
  startSession: () => void;
};

export function SessionStopped({
  isActivating,
  setIsActivating,
  startSession,
}: SessionStoppedProps) {
  function handleStartSession() {
    if (isActivating) return;

    setIsActivating(true);
    startSession();
  }

  return (
    <div className="flex items-center justify-center w-full h-full">
      <Button onClick={handleStartSession} className={isActivating ? 'bg-gray-600' : 'bg-red-600'}>
        <CloudLightning height={16} />
        {isActivating ? 'starting session...' : 'start session'}
      </Button>
    </div>
  );
}
