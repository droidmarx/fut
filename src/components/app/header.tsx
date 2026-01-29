import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/app/logo';
import { UserCog } from 'lucide-react';
import type { Settings } from '@/lib/types';

type AppHeaderProps = {
  settings: Settings;
};

export function AppHeader({ settings }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link
            href="/"
            className="mr-6 flex items-center space-x-2"
            aria-label="Página Inicial"
          >
            <Logo />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin">
              <UserCog className="h-5 w-5" />
              <span className="sr-only">Admin Panel</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
