import ClientPage from './client-page';
import { getQuestions } from '@/lib/loaders';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const { data } = await getQuestions();

  return <ClientPage questions={data || []} />;
}
