import Link from 'next/link';
import { Button } from '@/components/ui/button';

const NotFoundPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-balance">404 Not Found</h1>
        <p className="leading-7 my-6">ページが見つかりませんでした。</p>
        <Button asChild>
          <Link href="/">TOPへ戻る</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
