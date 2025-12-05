import Image from 'next/image';
import Link from 'next/link';
import { env } from '@/lib/environment';

export async function Header() {
  const isDev = env.isDevelopment;
  return (
    <header>
      <div className={`max-w-[1060px] mx-auto px-4 ${isDev ? 'bg-muted-foreground' : ''}`}>
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
              <Link href="/speaking">Speaking</Link>
              {isDev && <Link href="/realtime-chat">Realtime Chat</Link>}
              {isDev && <Link href="/admin">Admin</Link>}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
