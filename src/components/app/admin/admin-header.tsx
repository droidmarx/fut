import Link from 'next/link';
import { Logo } from '@/components/app/logo';
import { LogoutButton } from './logout-button';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export function AdminHeader() {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Logo showText={false} />
        </Link>
        <Link
          href="/admin/dashboard"
          className="text-foreground transition-colors hover:text-foreground"
        >
          Painel
        </Link>
      </nav>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="md:hidden">
            <Link href="/">
              <Logo showText={false}/>
            </Link>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
                <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Página Principal
                </Link>
            </Button>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
