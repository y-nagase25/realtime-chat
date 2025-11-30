import { SessionControl } from '@/components/SessionControl';

export default function Page() {
  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-3xl font-bold">Realtime API (WebRTC)</h1>

      {/* Control Section */}
      <SessionControl />
    </div>
  );
}
