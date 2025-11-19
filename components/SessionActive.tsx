import { CloudOff } from 'lucide-react';
import { Button } from './ui/button';

type SessionActiveProps = {
  stopSession: () => void;
};

export function SessionActive({ stopSession }: SessionActiveProps) {
  return (
    <div className="flex items-center justify-center w-full h-full gap-4">
      <Button onClick={stopSession}>
        <CloudOff height={16} />
        disconnect
      </Button>
    </div>
  );
}
