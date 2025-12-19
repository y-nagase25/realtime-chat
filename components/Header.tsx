'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const ROUTES = {
  HOME: '/',
  SPEAKING: '/speaking',
} as const;

export function Header() {
  const isDev = process.env.NODE_ENV === 'development';
  const pathname = usePathname();

  const isActiveLink = (href: string): boolean => {
    if (href === ROUTES.HOME) return pathname === ROUTES.HOME;
    return pathname.startsWith(href);
  };

  return (
    <header className={cn('mx-auto rounded-md border px-4', isDev && 'bg-muted-foreground')}>
      <nav className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-8">
          <Link href={ROUTES.HOME}>
            <Image
              src="/aigo-header.png"
              alt="AI-GO Logo"
              width={649}
              height={239}
              loading="eager"
              priority
              style={{
                width: '100px',
                height: 'auto',
                maxWidth: '100%',
              }}
            />
          </Link>
          <div className="flex items-center space-x-8">
            <Link
              href={ROUTES.SPEAKING}
              className={cn(
                'transition-colors',
                isActiveLink(ROUTES.SPEAKING) && 'border-b border-primary'
              )}
            >
              Speaking
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
