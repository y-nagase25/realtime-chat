import { prodNotFound } from '@/lib/environment';
import ClientPage from './client-page';

export default function AdminPage() {
  prodNotFound();
  return (
    <>
      <h1 className="text-3xl font-bold">Usage Statistics</h1>
      <ClientPage />
    </>
  );
}
