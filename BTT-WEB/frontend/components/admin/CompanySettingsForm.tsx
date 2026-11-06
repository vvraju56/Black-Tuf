'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  ExternalLink,
  Globe2,
  Loader2,
  Save,
  ShieldAlert,
  UserRound,
} from 'lucide-react';
import { AdminNotice } from '@/components/admin/AdminUI';
import { adminRequest, AdminApiError, fieldErrorsToMap } from '@/lib/admin';
import { DEFAULT_SETTINGS } from '@/lib/site';
import type { BusinessInfo, SiteSettings } from '@/lib/types';
import { cn } from '@/lib/utils';

function Section({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent/[0.07] text-accent">
          {icon}
        </span>
        <div>
          <h2 className="text-[0.98rem] font-semibold text-white">{title}</h2>
          <p className="mt-0.5 text-[0.78rem] leading-relaxed text-ink-muted">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-[0.72rem] text-red-300">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[0.68rem] text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5">
      <div>
        <p className="text-[0.8rem] font-medium text-white">{label}</p>
        <p className="text-[0.66rem] text-ink-faint">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full border transition-colors',
          checked ? 'border-accent/50 bg-accent/30' : 'border-white/15 bg-white/[0.06]'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full transition-all',
            checked ? 'left-[1.45rem] bg-accent' : 'left-0.5 bg-ink-faint'
          )}
        />
      </button>
    </div>
  );
}

export function CompanySettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [form, setForm] = useState<SiteSettings>({
    ...DEFAULT_SETTINGS,
    ...settings,
    business: { ...DEFAULT_SETTINGS.business, ...settings.business },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const setBusiness = <K extends keyof BusinessInfo>(key: K, value: BusinessInfo[K]) => {
    setForm((current) => ({ ...current, business: { ...current.business, [key]: value } }));
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setNotice('');
    setErrors({});

    if (form.companyName.trim().length < 2) {
      setErrors({ companyName: 'Add the company name.' });
      setMessage('Please fix the highlighted fields.');
      setSaving(false);
      return;
    }
    if (!form.supportHandle.trim()) {
      setErrors({ supportHandle: 'Add the public support handle.' });
      setMessage('Please fix the highlighted fields.');
      setSaving(false);
      return;
    }

    try {
      await adminRequest<SiteSettings>('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({
          companyName: form.companyName.trim(),
          brandName: form.brandName.trim(),
          tagline: form.tagline.trim(),
          description: form.description.trim(),
          supportHandle: form.supportHandle.trim(),
          supportUrl: form.supportUrl.trim(),
          socialWebsite: form.socialWebsite.trim(),
          socialGithub: form.socialGithub.trim(),
          socialLinkedin: form.socialLinkedin.trim(),
          business: form.business,
        }),
      });
      setNotice('Company information saved. The public site will reflect it on the next revalidation.');
      router.refresh();
    } catch (error) {
      if (error instanceof AdminApiError) {
        setErrors(fieldErrorsToMap(error.fieldErrors));
        setMessage(error.message);
      } else {
        setMessage('Could not save company information. Try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const errorFor = (key: string) => errors[key];

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {message ? <AdminNotice type="error">{message}</AdminNotice> : null}
      {notice ? <AdminNotice type="success">{notice}</AdminNotice> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          <Section
            title="Company identity"
            description="The names and copy used across the website, metadata, and footer."
            icon={<Building2 className="h-4 w-4" aria-hidden />}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Company name"
                htmlFor="company-name"
                error={errorFor('companyName')}
              >
                <input
                  id="company-name"
                  value={form.companyName}
                  onChange={(event) => set('companyName', event.target.value)}
                  className="field"
                  placeholder="BlackTuf Technologies"
                />
              </Field>
              <Field label="Brand name" htmlFor="brand-name" error={errorFor('brandName')}>
                <input
                  id="brand-name"
                  value={form.brandName}
                  onChange={(event) => set('brandName', event.target.value)}
                  className="field"
                  placeholder="BlackTuf"
                />
              </Field>
            </div>

            <div className="mt-4 space-y-4">
              <Field
                label="Tagline"
                htmlFor="company-tagline"
                hint={`${form.tagline.length}/200 characters`}
                error={errorFor('tagline')}
              >
                <input
                  id="company-tagline"
                  value={form.tagline}
                  onChange={(event) => set('tagline', event.target.value)}
                  maxLength={200}
                  className="field"
                />
              </Field>
              <Field
                label="Description"
                htmlFor="company-description"
                hint={`${form.description.length}/400 characters. Used as the default meta description.`}
                error={errorFor('description')}
              >
                <textarea
                  id="company-description"
                  value={form.description}
                  onChange={(event) => set('description', event.target.value)}
                  maxLength={400}
                  rows={3}
                  className="field resize-y"
                />
              </Field>
            </div>
          </Section>

          <Section
            title="Support identity"
            description="How visitors reach support. The handle is shown on the support page and in the footer."
            icon={<UserRound className="h-4 w-4" aria-hidden />}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Support handle"
                htmlFor="support-handle"
                hint="Displayed with the @ symbol, for example @blacktuftech."
                error={errorFor('supportHandle')}
              >
                <input
                  id="support-handle"
                  value={form.supportHandle}
                  onChange={(event) => set('supportHandle', event.target.value)}
                  className="field"
                  placeholder="@blacktuftech"
                />
              </Field>
              <Field
                label="Support URL"
                htmlFor="support-url"
                hint="Leave empty to render the handle as plain text instead of a link."
                error={errorFor('supportUrl')}
              >
                <input
                  id="support-url"
                  type="url"
                  value={form.supportUrl}
                  onChange={(event) => set('supportUrl', event.target.value)}
                  className="field"
                  placeholder="https://…"
                />
              </Field>
            </div>
            <div className="mt-4 rounded-lg border border-white/[0.07] bg-[#0b0b10] px-3.5 py-2.5">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                Preview
              </p>
              <p className="mt-1 text-[0.82rem] text-ink-muted">
                Support:{' '}
                {form.supportUrl ? (
                  <a
                    href={form.supportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-accent-soft hover:text-white"
                  >
                    {form.supportHandle || '@handle'}
                    <ExternalLink className="h-3 w-3" aria-hidden />
                  </a>
                ) : (
                  <span className="text-white">{form.supportHandle || '@handle'}</span>
                )}
              </p>
            </div>
          </Section>

          <Section
            title="Owner links"
            description="Public profiles linked from the footer and about page. Empty links are hidden."
            icon={<Globe2 className="h-4 w-4" aria-hidden />}
          >
            <div className="space-y-3">
              <Field label="Website" htmlFor="social-website" error={errorFor('socialWebsite')}>
                <input
                  id="social-website"
                  type="url"
                  value={form.socialWebsite}
                  onChange={(event) => set('socialWebsite', event.target.value)}
                  className="field"
                  placeholder="https://…"
                />
              </Field>
              <Field label="GitHub" htmlFor="social-github" error={errorFor('socialGithub')}>
                <input
                  id="social-github"
                  type="url"
                  value={form.socialGithub}
                  onChange={(event) => set('socialGithub', event.target.value)}
                  className="field"
                  placeholder="https://github.com/…"
                />
              </Field>
              <Field label="LinkedIn" htmlFor="social-linkedin" error={errorFor('socialLinkedin')}>
                <input
                  id="social-linkedin"
                  type="url"
                  value={form.socialLinkedin}
                  onChange={(event) => set('socialLinkedin', event.target.value)}
                  className="field"
                  placeholder="https://www.linkedin.com/…"
                />
              </Field>
            </div>
          </Section>

          <Section
            title="Business information"
            description="Optional, non-sensitive company details. Only publish what you are comfortable showing publicly."
            icon={<ShieldAlert className="h-4 w-4" aria-hidden />}
          >
            <div className="mb-4 rounded-lg border border-amber-400/25 bg-amber-400/[0.06] px-3.5 py-2.5 text-[0.74rem] leading-relaxed text-amber-200">
              Do not enter registration numbers, certificate IDs, PAN, GSTIN, addresses, or any
              other private identifier here. This content is public.
            </div>
            <div className="space-y-4">
              <Toggle
                label="Show business information"
                description="Controls whether the public about page displays this section."
                checked={form.business.showBusinessInfo}
                onChange={(value) => setBusiness('showBusinessInfo', value)}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Enterprise name"
                  htmlFor="business-enterprise"
                  error={errorFor('business.enterpriseName')}
                >
                  <input
                    id="business-enterprise"
                    value={form.business.enterpriseName}
                    onChange={(event) => setBusiness('enterpriseName', event.target.value)}
                    className="field"
                  />
                </Field>
                <Field
                  label="Business type"
                  htmlFor="business-type"
                  error={errorFor('business.businessType')}
                >
                  <input
                    id="business-type"
                    value={form.business.businessType}
                    onChange={(event) => setBusiness('businessType', event.target.value)}
                    className="field"
                    placeholder="Micro Enterprise"
                  />
                </Field>
                <Field
                  label="Major activity"
                  htmlFor="business-activity"
                  error={errorFor('business.majorActivity')}
                >
                  <input
                    id="business-activity"
                    value={form.business.majorActivity}
                    onChange={(event) => setBusiness('majorActivity', event.target.value)}
                    className="field"
                  />
                </Field>
                <Field
                  label="Industry"
                  htmlFor="business-industry"
                  error={errorFor('business.industry')}
                >
                  <input
                    id="business-industry"
                    value={form.business.industry}
                    onChange={(event) => setBusiness('industry', event.target.value)}
                    className="field"
                  />
                </Field>
              </div>
              <Field
                label="Registration note"
                htmlFor="business-note"
                hint="A short, non-sensitive sentence. No identifiers."
                error={errorFor('business.registrationNote')}
              >
                <textarea
                  id="business-note"
                  value={form.business.registrationNote}
                  onChange={(event) => setBusiness('registrationNote', event.target.value)}
                  maxLength={300}
                  rows={2}
                  className="field resize-y"
                />
              </Field>
            </div>
          </Section>

          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Save className="h-4 w-4" aria-hidden />
            )}
            {saving ? 'Saving…' : 'Save company information'}
          </button>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
              Live brand preview
            </p>
            <p className="mt-3 font-display text-xl font-semibold tracking-[-0.04em] text-white">
              {form.brandName || 'BlackTuf'}
            </p>
            <p className="mt-1 text-[0.78rem] leading-relaxed text-accent-soft/90">
              {form.tagline || 'Tagline appears here.'}
            </p>
            <p className="mt-3 border-t border-white/[0.07] pt-3 text-[0.74rem] leading-relaxed text-ink-muted">
              {form.description || 'Company description used for metadata and introductions.'}
            </p>
            <p className="mt-3 text-[0.7rem] text-ink-faint">
              Support:{' '}
              {form.supportUrl ? (
                <span className="text-accent-soft">{form.supportHandle}</span>
              ) : (
                <span className="text-white">{form.supportHandle}</span>
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 text-[0.74rem] leading-relaxed text-ink-muted">
            <p className="font-semibold text-white">Where this appears</p>
            <ul className="mt-2 space-y-1.5">
              <li>· Navigation and footer branding</li>
              <li>· Homepage introduction and metadata</li>
              <li>· Support and contact pages</li>
              <li>· About page business information</li>
            </ul>
          </div>
        </aside>
      </div>
    </form>
  );
}
