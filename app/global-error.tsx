'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Error boundaries must be Client Components

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  console.log(error);
  return (
    // global-error must include html and body tags
    <html lang="ja" className="dark">
      <body>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-full max-w-md p-6 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-balance">Oops</h1>
            <p className="leading-7 my-6">
              エラーが発生しました。
              <br />
              しばらくしてからもう一度お試しください。
            </p>
            <Button asChild>
              <Link href="/">TOPへ戻る</Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
