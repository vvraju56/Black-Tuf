import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/admin/LoginForm';
import { getAdmin } from '@/lib/admin-server';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Admin Sign In',
  description: 'Private BlackTuf Technologies administration area.',
  path: '/admin/login',
  noIndex: true,
});

export default async function AdminLoginPage() {
  const admin = await getAdmin();
  if (admin) redirect('/admin');

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0 bg-hero-glow" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-grid-fade bg-[size:64px_64px] opacity-[0.12] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
        aria-hidden
      />
      <div
        className="glow-orb pointer-events-none absolute -right-32 top-10 h-80 w-80 opacity-40"
        aria-hidden
      />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="eyebrow justify-center">Private area</p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.045em] text-white">
            BlackTuf Admin
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-[0.84rem] leading-relaxed text-ink-muted">
            Sign in to manage products, services, messages, and company information.
          </p>
        </div>

        <div className="glass-strong rounded-2xl p-6 sm:p-7">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-[0.72rem] leading-relaxed text-ink-faint">
          Authorised administrators only. All sign-in attempts are rate limited.
        </p>
      </div>
    </div>
  );
}
