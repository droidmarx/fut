import * as React from 'react';
import { protectAdminRoute } from '@/app/lib/auth';
import { AdminHeader } from '@/components/app/admin/admin-header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await protectAdminRoute();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AdminHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}
