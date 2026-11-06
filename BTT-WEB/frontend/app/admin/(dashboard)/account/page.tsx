import { CalendarClock, KeyRound, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminUI';
import { PasswordForm } from '@/components/admin/PasswordForm';
import { requireAdmin } from '@/lib/admin-server';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminAccountPage() {
  const admin = await requireAdmin();

  return (
    <>
      <AdminPageHeader
        eyebrow="Account"
        title="Your account"
        description="Review the signed-in administrator profile and change the password used to access this dashboard."
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/25 bg-accent/10 text-[0.9rem] font-bold text-accent-soft">
              {admin.name
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase())
                .join('')}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[0.95rem] font-semibold text-white">{admin.name}</p>
              <p className="truncate text-[0.74rem] text-ink-muted">{admin.email}</p>
            </div>
          </div>

          <dl className="mt-6 space-y-4 border-t border-white/[0.07] pt-5 text-[0.8rem]">
            <div className="flex items-start gap-3">
              <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-accent/80" aria-hidden />
              <div>
                <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                  Role
                </dt>
                <dd className="mt-0.5 capitalize text-white">{admin.role}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent/80" aria-hidden />
              <div>
                <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                  Sign-in email
                </dt>
                <dd className="mt-0.5 break-all text-white">{admin.email}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-accent/80" aria-hidden />
              <div>
                <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                  Last sign in
                </dt>
                <dd className="mt-0.5 text-white">
                  {admin.lastLoginAt
                    ? formatDate(admin.lastLoginAt, {
                        hour: 'numeric',
                        minute: '2-digit',
                      })
                    : 'This session'}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent/80" aria-hidden />
              <div>
                <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                  Session
                </dt>
                <dd className="mt-0.5 text-white">HTTP-only cookie · 7 days</dd>
              </div>
            </div>
          </dl>

          <p className="mt-5 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-[0.72rem] leading-relaxed text-ink-muted">
            Administrator profiles are created from the server with the seed command. To change the
            name or email on this account, update it in the database and sign in again.
          </p>
        </section>

        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent/[0.07] text-accent">
              <KeyRound className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <h2 className="text-[0.98rem] font-semibold text-white">Change password</h2>
              <p className="mt-0.5 text-[0.78rem] leading-relaxed text-ink-muted">
                Choose a unique password you do not use anywhere else. Changing it does not sign out
                other sessions until their token expires.
              </p>
            </div>
          </div>
          <PasswordForm />
        </section>
      </div>
    </>
  );
}
