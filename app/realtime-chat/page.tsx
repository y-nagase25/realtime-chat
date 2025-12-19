import { SessionControl } from '@/components/SessionControl';
import { prodNotFound } from '@/lib/environment';

export default function RealtimeChatPage() {
  prodNotFound();
  return (
    <>
      <h1 className="text-3xl font-bold">Realtime API (WebRTC)</h1>
      <SessionControl />
    </>
  );
}
