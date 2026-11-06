'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, LockKeyhole, LogIn } from 'lucide-react';
import { adminRequest, AdminApiError, fieldErrorsToMap } from '@/lib/admin';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setErrors({});

    try {
      await adminRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      router.replace('/admin');
      router.refresh();
    } catch (error) {
      if (error instanceof AdminApiError) {
        setErrors(fieldErrorsToMap(error.fieldErrors));
        setMessage(error.message);
      } else {
        setMessage('Could not sign in. Check your connection and try again.');
      }
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="admin-email" className="label">
          Email address
        </label>
        <input
          id="admin-email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="field"
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email) || undefined}
          aria-describedby={errors.email ? 'admin-email-error' : undefined}
        />
        {errors.email ? (
          <p id="admin-email-error" className="mt-1.5 text-[0.72rem] text-red-300">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="admin-password" className="label">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="field"
          placeholder="••••••••••"
          aria-invalid={Boolean(errors.password) || undefined}
          aria-describedby={errors.password ? 'admin-password-error' : undefined}
        />
        {errors.password ? (
          <p id="admin-password-error" className="mt-1.5 text-[0.72rem] text-red-300">
            {errors.password}
          </p>
        ) : null}
      </div>

      {message ? (
        <p
          role="alert"
          className="rounded-lg border border-red-400/25 bg-red-400/[0.07] px-3.5 py-2.5 text-[0.8rem] text-red-200"
        >
          {message}
        </p>
      ) : null}

      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <LogIn className="h-4 w-4" aria-hidden />
        )}
        {loading ? 'Signing in…' : 'Sign in'}
      </button>

      <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[0.74rem] text-ink-muted transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to website
        </Link>
        <span className="inline-flex items-center gap-1.5 text-[0.66rem] text-ink-faint">
          <LockKeyhole className="h-3 w-3" aria-hidden /> HTTP-only session
        </span>
      </div>
    </form>
  );
}
