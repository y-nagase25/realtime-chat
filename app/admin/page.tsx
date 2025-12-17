import { prodNotFound } from '@/lib/environment';
import ClientPage from './client-page';

export default function AdminPage() {
  prodNotFound();
  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-3xl font-bold">Usage Statistics</h1>
      <ClientPage />
    </div>
  );
}
