'use client';
import { Button } from '@/components/ui/button';
import { logout } from '@/app/actions';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  return (
    <form action={logout}>
      <Button variant="outline" size="sm" type="submit">
        <LogOut className="mr-2 h-4 w-4" />
        Sair
      </Button>
    </form>
  );
}
