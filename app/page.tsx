import { SessionControl } from '@/components/SessionControl';

export default function Page() {
  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Realtime Console</h1>
      </div>
      <main>
        <section>{/* TODO: event log area */}</section>
        <section>
          <SessionControl />
        </section>
      </main>
    </>
  );
}
