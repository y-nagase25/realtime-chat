import Image from 'next/image';
import Link from 'next/link';

export function Header() {
  return (
    <header>
      <div className="max-w-[1060px] mx-auto px-4">
        <nav className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <Image
                src="/aigo-header.png"
                alt="AI-GO Logo"
                width={100}
                height={100}
                loading="eager"
              />
            </Link>
            <div className="flex items-center space-x-8">
              <Link href="/transcribe">Transcribe</Link>
              <Link href="/speaking-practice">Speaking</Link>
              <Link href="/realtime-api/beta">Chat[Beta]</Link>
              <Link href="/realtime-api/ga">Chat[GA]</Link>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
