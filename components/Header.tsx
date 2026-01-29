'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const ROUTES = [
  { label: 'Reading', href: '/reading' },
  { label: 'Speaking', href: '/speaking' },
  { label: 'History', href: '/history' },
];

export function Header() {
  const pathname = usePathname();

  const isActiveLink = (href: string): boolean => {
    return pathname.startsWith(href);
  };

  return (
    <header className="mx-auto rounded-md border px-4">
      <nav className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-8">
          <Link href="/">
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
            {ROUTES.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  'transition-colors',
                  isActiveLink(route.href) && 'border-b border-primary'
                )}
              >
                {route.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
