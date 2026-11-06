import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin/AdminShell';
import { requireAdmin } from '@/lib/admin-server';

export const metadata: Metadata = {
  title: 'Admin — BlackTuf Technologies',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return <AdminShell admin={admin}>{children}</AdminShell>;
}
