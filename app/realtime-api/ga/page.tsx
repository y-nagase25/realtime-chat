import { SessionControl } from '@/components/SessionControl';
import SessionStatus from '@/components/SessionStatus';

export default function Page() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Realtime API (WebRTC)</h1>
      {/* Status Section */}
      <SessionStatus />

      {/* Control Section */}
      <SessionControl />
    </div>
  );
}
