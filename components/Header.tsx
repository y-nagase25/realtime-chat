import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from '@/components/ui/menubar';
import Link from 'next/link';

export function Header() {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Pages</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            <Link href={'/realtime-api'}>Realtime API</Link>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
