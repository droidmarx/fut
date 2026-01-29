import { verifySession } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { AdminLoginForm } from '@/components/app/admin/admin-login-form';

export default async function AdminLoginPage() {
  if (await verifySession()) {
    redirect('/admin/dashboard');
  }

  return <AdminLoginForm />;
}
