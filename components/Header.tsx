import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar';
import Link from 'next/link';

export function Header() {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Pages</MenubarTrigger>
        <MenubarContent>
          <MenubarItem asChild>
            <Link href={'/'}>TOP</Link>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem asChild>
            <Link href={'/transcribe'}>Transcribe</Link>
          </MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger>Realtime API</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem asChild>
                <Link href={'/realtime-api/beta'}>Beta</Link>
              </MenubarItem>
              <MenubarItem asChild>
                <Link href={'/realtime-api/ga'}>GA</Link>
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
