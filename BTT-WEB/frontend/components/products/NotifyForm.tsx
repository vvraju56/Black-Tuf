'use client';

import { useState } from 'react';
import { Bell, CheckCircle2, Loader2 } from 'lucide-react';

export function NotifyForm({ slug, productName }: { slug: string; productName: string }) {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setState('loading');
    setMessage('');

    try {
      const response = await fetch(`/api/backend/products/${encodeURIComponent(slug)}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || 'Something went wrong. Please try again.');
      }
      setState('success');
      setMessage(payload.message || "You're on the list.");
      setEmail('');
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'Something went wrong.');
    }
  };

  if (state === 'success') {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.08] px-4 py-3.5 text-sm text-emerald-200"
      >
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="flex-1">
          <span className="sr-only">Email address for {productName} launch updates</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="field"
            aria-invalid={state === 'error' ? true : undefined}
          />
        </label>
        <button type="submit" disabled={state === 'loading'} className="btn btn-primary">
          {state === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Bell className="h-4 w-4" aria-hidden />
          )}
          Notify me
        </button>
      </div>
      <input
        type="text"
        name="website"
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      {state === 'error' && message ? (
        <p role="alert" className="text-[0.78rem] text-red-300">
          {message}
        </p>
      ) : (
        <p className="text-[0.7rem] text-ink-faint">
          We&apos;ll only email you about {productName} launch updates.
        </p>
      )}
    </form>
  );
}
