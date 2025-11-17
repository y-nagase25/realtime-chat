import { MicPermissionStatus } from '@/components/transcript/MicPermissionStatus';
import { RecordingControls } from '@/components/transcript/RecordingControls';

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Voice Transcriber</h1>
          <p className="mt-2 text-muted-foreground">
            Record your voice and get instant transcriptions
          </p>
        </div>
        <MicPermissionStatus />
        <RecordingControls />
      </div>
    </div>
  );
}
