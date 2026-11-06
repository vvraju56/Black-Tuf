'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, Paperclip, Send } from 'lucide-react';
import { SUPPORT_ISSUE_TYPES } from '@/lib/site';

type FieldErrors = Record<string, string>;

export function SupportForm({
  products,
  defaultProduct = '',
  defaultIssue = 'Product Support',
}: {
  products: { name: string; slug: string }[];
  defaultProduct?: string;
  defaultIssue?: string;
}) {
  const issueDefault = (SUPPORT_ISSUE_TYPES as readonly string[]).includes(defaultIssue)
    ? defaultIssue
    : 'Product Support';

  const [values, setValues] = useState({
    name: '',
    email: '',
    productName: defaultProduct,
    issueType: issueDefault,
    message: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  const update = (key: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');
    setMessage('');
    setErrors({});

    if (file && file.size > 8 * 1024 * 1024) {
      setStatus('error');
      setMessage('Attachments must be 8 MB or smaller.');
      return;
    }

    try {
      const body = new FormData();
      body.append('name', values.name);
      body.append('email', values.email);
      body.append('productName', values.productName);
      body.append('issueType', values.issueType);
      body.append('message', values.message);
      body.append('website', website);
      if (file) body.append('attachment', file);

      const response = await fetch('/api/backend/support', { method: 'POST', body });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload?.success) {
        if (Array.isArray(payload?.errors)) {
          const fieldErrors: FieldErrors = {};
          for (const item of payload.errors) {
            if (item?.field) fieldErrors[item.field] = item.message;
          }
          setErrors(fieldErrors);
        }
        throw new Error(payload?.message || 'Your request could not be sent. Please try again.');
      }

      setStatus('success');
      setMessage(payload.message || "Your request has been received. We'll follow up by email.");
      setValues({
        name: '',
        email: '',
        productName: '',
        issueType: issueDefault,
        message: '',
      });
      setFile(null);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Something went wrong.');
    }
  };

  if (status === 'success') {
    return (
      <div
        role="status"
        className="flex flex-col items-center rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.07] px-6 py-12 text-center"
      >
        <CheckCircle2 className="h-10 w-10 text-emerald-300" aria-hidden />
        <h3 className="mt-4 font-display text-xl font-semibold text-white">Request received</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">{message}</p>
        <button type="button" onClick={() => setStatus('idle')} className="btn btn-secondary mt-6">
          Submit another request
        </button>
      </div>
    );
  }

  const fieldError = (key: string) =>
    errors[key] ? (
      <p id={`support-${key}-error`} className="mt-1.5 text-[0.72rem] text-red-300">
        {errors[key]}
      </p>
    ) : null;

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="support-name" className="label">
            Name <span className="text-accent">*</span>
          </label>
          <input
            id="support-name"
            type="text"
            required
            autoComplete="name"
            value={values.name}
            onChange={(event) => update('name', event.target.value)}
            className="field"
            aria-invalid={Boolean(errors.name) || undefined}
          />
          {fieldError('name')}
        </div>
        <div>
          <label htmlFor="support-email" className="label">
            Email <span className="text-accent">*</span>
          </label>
          <input
            id="support-email"
            type="email"
            required
            autoComplete="email"
            value={values.email}
            onChange={(event) => update('email', event.target.value)}
            className="field"
            aria-invalid={Boolean(errors.email) || undefined}
          />
          {fieldError('email')}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="support-product" className="label">
            Product
          </label>
          <select
            id="support-product"
            value={values.productName}
            onChange={(event) => update('productName', event.target.value)}
            className="field cursor-pointer"
          >
            <option value="" className="bg-[#0b0b10]">
              General / not product-specific
            </option>
            {products.map((product) => (
              <option key={product.slug} value={product.name} className="bg-[#0b0b10]">
                {product.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="support-issue" className="label">
            Issue type <span className="text-accent">*</span>
          </label>
          <select
            id="support-issue"
            value={values.issueType}
            onChange={(event) => update('issueType', event.target.value)}
            className="field cursor-pointer"
          >
            {SUPPORT_ISSUE_TYPES.map((type) => (
              <option key={type} value={type} className="bg-[#0b0b10]">
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="support-message" className="label">
          Message <span className="text-accent">*</span>
        </label>
        <textarea
          id="support-message"
          required
          rows={6}
          value={values.message}
          onChange={(event) => update('message', event.target.value)}
          className="field resize-y"
          placeholder="Describe what you expected, what happened, and any steps that reproduce it."
          aria-invalid={Boolean(errors.message) || undefined}
        />
        {fieldError('message')}
      </div>

      <div>
        <span className="label">Attachment (optional)</span>
        <label
          htmlFor="support-attachment"
          className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-dashed border-white/15 bg-white/[0.025] px-4 py-3 text-[0.8rem] text-ink-muted transition-colors hover:border-accent/35 hover:text-white"
        >
          <Paperclip className="h-4 w-4 text-accent" aria-hidden />
          {file ? file.name : 'Attach a screenshot or document (max 8 MB)'}
        </label>
        <input
          id="support-attachment"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif,application/pdf,text/plain,.doc,.docx,.zip"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          className="sr-only"
        />
        <p className="mt-1.5 text-[0.68rem] text-ink-faint">
          Do not include passwords, tokens, or private personal information.
        </p>
      </div>

      <div className="hidden" aria-hidden="true">
        <label htmlFor="support-website">Website</label>
        <input
          id="support-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      {status === 'error' && message ? (
        <p role="alert" className="rounded-lg border border-red-400/25 bg-red-400/[0.07] px-4 py-3 text-sm text-red-200">
          {message}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.72rem] text-ink-faint">
          We use these details only to help with your request.
        </p>
        <button type="submit" disabled={status === 'loading'} className="btn btn-primary">
          {status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Send className="h-4 w-4" aria-hidden />
          )}
          {status === 'loading' ? 'Submitting…' : 'Submit request'}
        </button>
      </div>
    </form>
  );
}
