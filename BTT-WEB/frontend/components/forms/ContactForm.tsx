'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BUDGET_OPTIONS, CONTACT_SUBJECTS, PROJECT_TYPES } from '@/lib/site';

interface ContactFormState {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  productName: string;
  projectType: string;
  budget: string;
}

const INITIAL: ContactFormState = {
  name: '',
  email: '',
  company: '',
  subject: CONTACT_SUBJECTS[0],
  message: '',
  productName: '',
  projectType: '',
  budget: '',
};

type FieldErrors = Record<string, string>;

export function ContactForm({
  products,
  defaultProduct = '',
  compact = false,
}: {
  products: { name: string; slug: string }[];
  defaultProduct?: string;
  compact?: boolean;
}) {
  const [values, setValues] = useState<ContactFormState>({
    ...INITIAL,
    productName: defaultProduct,
  });
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  const update = (key: keyof ContactFormState, value: string) => {
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

    try {
      const response = await fetch('/api/backend/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, website }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload?.success) {
        if (Array.isArray(payload?.errors)) {
          const fieldErrors: FieldErrors = {};
          for (const item of payload.errors) {
            if (item?.field) fieldErrors[item.field] = item.message;
          }
          setErrors(fieldErrors);
        }
        throw new Error(payload?.message || 'Your message could not be sent. Please try again.');
      }

      setStatus('success');
      setMessage(payload.message || "Thanks for reaching out. We'll get back to you soon.");
      setValues({ ...INITIAL, productName: '' });
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
        <h3 className="mt-4 font-display text-xl font-semibold text-white">Message sent</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">{message}</p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="btn btn-secondary mt-6"
        >
          Send another message
        </button>
      </div>
    );
  }

  const fieldError = (key: string) =>
    errors[key] ? (
      <p id={`contact-${key}-error`} className="mt-1.5 text-[0.72rem] text-red-300">
        {errors[key]}
      </p>
    ) : null;

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className={cn('grid gap-4', compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2')}>
        <div>
          <label htmlFor="contact-name" className="label">
            Name <span className="text-accent">*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            value={values.name}
            onChange={(event) => update('name', event.target.value)}
            className="field"
            aria-invalid={Boolean(errors.name) || undefined}
            aria-describedby={errors.name ? 'contact-name-error' : undefined}
          />
          {fieldError('name')}
        </div>
        <div>
          <label htmlFor="contact-email" className="label">
            Email <span className="text-accent">*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={values.email}
            onChange={(event) => update('email', event.target.value)}
            className="field"
            aria-invalid={Boolean(errors.email) || undefined}
            aria-describedby={errors.email ? 'contact-email-error' : undefined}
          />
          {fieldError('email')}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-company" className="label">
            Company / organisation
          </label>
          <input
            id="contact-company"
            name="company"
            type="text"
            autoComplete="organization"
            value={values.company}
            onChange={(event) => update('company', event.target.value)}
            className="field"
          />
        </div>
        <div>
          <label htmlFor="contact-subject" className="label">
            Subject <span className="text-accent">*</span>
          </label>
          <select
            id="contact-subject"
            name="subject"
            required
            value={values.subject}
            onChange={(event) => update('subject', event.target.value)}
            className="field cursor-pointer"
          >
            {CONTACT_SUBJECTS.map((subject) => (
              <option key={subject} value={subject} className="bg-[#0b0b10]">
                {subject}
              </option>
            ))}
          </select>
          {fieldError('subject')}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="contact-product" className="label">
            Product
          </label>
          <select
            id="contact-product"
            name="productName"
            value={values.productName}
            onChange={(event) => update('productName', event.target.value)}
            className="field cursor-pointer"
          >
            <option value="" className="bg-[#0b0b10]">
              Not product-specific
            </option>
            {products.map((product) => (
              <option key={product.slug} value={product.name} className="bg-[#0b0b10]">
                {product.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="contact-project" className="label">
            Project type
          </label>
          <select
            id="contact-project"
            name="projectType"
            value={values.projectType}
            onChange={(event) => update('projectType', event.target.value)}
            className="field cursor-pointer"
          >
            <option value="" className="bg-[#0b0b10]">
              Select…
            </option>
            {PROJECT_TYPES.map((type) => (
              <option key={type} value={type} className="bg-[#0b0b10]">
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="contact-budget" className="label">
            Budget
          </label>
          <select
            id="contact-budget"
            name="budget"
            value={values.budget}
            onChange={(event) => update('budget', event.target.value)}
            className="field cursor-pointer"
          >
            <option value="" className="bg-[#0b0b10]">
              Optional
            </option>
            {BUDGET_OPTIONS.map((budget) => (
              <option key={budget} value={budget} className="bg-[#0b0b10]">
                {budget}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className="label">
          Message <span className="text-accent">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={compact ? 4 : 6}
          value={values.message}
          onChange={(event) => update('message', event.target.value)}
          className="field resize-y"
          placeholder="Tell us what you are trying to build, or what you need help with."
          aria-invalid={Boolean(errors.message) || undefined}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
        />
        {fieldError('message')}
      </div>

      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
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
          We only use your details to reply to this message.
        </p>
        <button type="submit" disabled={status === 'loading'} className="btn btn-primary">
          {status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Send className="h-4 w-4" aria-hidden />
          )}
          {status === 'loading' ? 'Sending…' : 'Send message'}
        </button>
      </div>
    </form>
  );
}
