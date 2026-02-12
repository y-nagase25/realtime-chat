'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/lib/constants';
import { HeaderPopover } from './HeaderPopover';

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
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-colors',
                  isActiveLink(item.href) && 'border-b border-primary'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <HeaderPopover />
      </nav>
    </header>
  );
}
