'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { AdminEmpty, AdminNotice } from '@/components/admin/AdminUI';
import { adminRequest, AdminApiError, fieldErrorsToMap } from '@/lib/admin';
import { ICON_NAMES } from '@/lib/icons';
import type { Service } from '@/lib/types';

type Draft = {
  id?: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  icon: string;
  featuresText: string;
  order: number;
  published: boolean;
};

const EMPTY: Draft = {
  title: '',
  slug: '',
  shortDescription: '',
  description: '',
  icon: 'Code2',
  featuresText: '',
  order: 0,
  published: true,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function toDraft(service: Service): Draft {
  return {
    id: service.id,
    title: service.title,
    slug: service.slug,
    shortDescription: service.shortDescription,
    description: service.description,
    icon: service.icon,
    featuresText: service.features.join('\n'),
    order: service.order,
    published: service.published ?? true,
  };
}

export function ServiceManager({ initialServices }: { initialServices: Service[] }) {
  const router = useRouter();
  const [services, setServices] = useState(initialServices);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const openNew = () => {
    setDraft({ ...EMPTY });
    setSlugTouched(false);
    setErrors({});
    setMessage('');
    setNotice('');
  };

  const openEdit = (service: Service) => {
    setDraft(toDraft(service));
    setSlugTouched(true);
    setErrors({});
    setMessage('');
    setNotice('');
  };

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
    setErrors((current) => {
      if (!current[key as string]) return current;
      const next = { ...current };
      delete next[key as string];
      return next;
    });
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft) return;
    setSaving(true);
    setMessage('');
    setNotice('');
    setErrors({});

    const localErrors: Record<string, string> = {};
    if (draft.title.trim().length < 2) localErrors.title = 'Add a service title.';
    if (draft.shortDescription.trim().length < 10)
      localErrors.shortDescription = 'Add a short description of at least 10 characters.';
    if (Object.keys(localErrors).length) {
      setErrors(localErrors);
      setMessage('Please fix the highlighted fields.');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        title: draft.title.trim(),
        slug: draft.slug.trim(),
        shortDescription: draft.shortDescription.trim(),
        description: draft.description.trim(),
        icon: draft.icon,
        features: draft.featuresText
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
        order: Number(draft.order) || 0,
        published: draft.published,
      };
      const saved = await adminRequest<Service>(
        draft.id ? `/admin/services/${draft.id}` : '/admin/services',
        {
          method: draft.id ? 'PUT' : 'POST',
          body: JSON.stringify(payload),
        }
      );
      setServices((current) => {
        if (draft.id) {
          return current.map((item) =>
            item.id === draft.id
              ? { ...item, ...payload, id: draft.id, slug: saved.slug || payload.slug }
              : item
          );
        }
        return [...current, { ...saved, ...payload, id: saved.id }];
      });
      setNotice(draft.id ? 'Service updated.' : 'Service created.');
      if (!draft.id) setDraft({ ...EMPTY });
      router.refresh();
    } catch (error) {
      if (error instanceof AdminApiError) {
        setErrors(fieldErrorsToMap(error.fieldErrors));
        setMessage(error.message);
      } else {
        setMessage('Could not save the service.');
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async (service: Service) => {
    if (
      !window.confirm(
        `Delete “${service.title}”? This removes it from the public services page and cannot be undone.`
      )
    ) {
      return;
    }
    setBusy(service.id);
    setMessage('');
    setNotice('');
    try {
      await adminRequest(`/admin/services/${service.id}`, { method: 'DELETE' });
      setServices((current) => current.filter((item) => item.id !== service.id));
      if (draft?.id === service.id) setDraft(null);
      setNotice('Service deleted.');
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof AdminApiError ? error.message : 'Could not delete the service.'
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_26rem]">
      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-[0.78rem] text-ink-muted">
            {services.length} {services.length === 1 ? 'service' : 'services'} ·{' '}
            {services.filter((service) => service.published !== false).length} published
          </p>
          <button type="button" onClick={openNew} className="btn btn-primary">
            <Plus className="h-4 w-4" aria-hidden /> New service
          </button>
        </div>

        {message ? (
          <div className="mb-4">
            <AdminNotice type="error">{message}</AdminNotice>
          </div>
        ) : null}
        {notice ? (
          <div className="mb-4">
            <AdminNotice type="success">{notice}</AdminNotice>
          </div>
        ) : null}

        {services.length ? (
          <ul className="space-y-3">
            {[...services]
              .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
              .map((service) => (
                <li
                  key={service.id}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[0.92rem] font-semibold text-white">{service.title}</h3>
                        <span className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[0.6rem] font-medium text-ink-muted">
                          {service.icon}
                        </span>
                        {service.published === false ? (
                          <span className="rounded border border-amber-400/25 bg-amber-400/10 px-1.5 py-0.5 text-[0.6rem] font-semibold text-amber-300">
                            Hidden
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-[0.78rem] leading-relaxed text-ink-muted">
                        {service.shortDescription}
                      </p>
                      {service.features.length ? (
                        <p className="mt-2 text-[0.68rem] text-ink-faint">
                          {service.features.length}{' '}
                          {service.features.length === 1 ? 'feature' : 'features'} ·{' '}
                          {service.slug}
                        </p>
                      ) : (
                        <p className="mt-2 text-[0.68rem] text-ink-faint">{service.slug}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(service)}
                        className="rounded-md border border-white/10 bg-white/[0.04] p-1.5 text-ink-muted transition-colors hover:text-white"
                        aria-label={`Edit ${service.title}`}
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(service)}
                        disabled={busy === service.id}
                        className="rounded-md border border-red-400/20 bg-red-400/[0.06] p-1.5 text-red-300 transition-colors hover:bg-red-400/15"
                        aria-label={`Delete ${service.title}`}
                      >
                        {busy === service.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        )}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        ) : (
          <AdminEmpty
            title="No services yet"
            description="Add the capability areas shown on the services page."
            action={
              <button type="button" onClick={openNew} className="btn btn-primary">
                <Plus className="h-4 w-4" aria-hidden /> New service
              </button>
            }
          />
        )}
      </div>

      <aside className="xl:sticky xl:top-24 xl:self-start">
        {draft ? (
          <form
            onSubmit={save}
            noValidate
            className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-[0.95rem] font-semibold text-white">
                {draft.id ? 'Edit service' : 'New service'}
              </h2>
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="rounded-md p-1 text-ink-faint hover:text-white"
                aria-label="Close editor"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label htmlFor="service-title" className="label">
                  Title
                </label>
                <input
                  id="service-title"
                  value={draft.title}
                  onChange={(event) => {
                    const value = event.target.value;
                    set('title', value);
                    if (!slugTouched) set('slug', slugify(value));
                  }}
                  className="field text-[0.84rem]"
                />
                {errors.title ? (
                  <p className="mt-1.5 text-[0.72rem] text-red-300">{errors.title}</p>
                ) : null}
              </div>

              <div>
                <label htmlFor="service-slug" className="label">
                  Slug
                </label>
                <input
                  id="service-slug"
                  value={draft.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    set('slug', slugify(event.target.value));
                  }}
                  className="field font-mono text-[0.78rem]"
                />
                {errors.slug ? (
                  <p className="mt-1.5 text-[0.72rem] text-red-300">{errors.slug}</p>
                ) : null}
              </div>

              <div>
                <label htmlFor="service-short" className="label">
                  Short description
                </label>
                <textarea
                  id="service-short"
                  value={draft.shortDescription}
                  onChange={(event) => set('shortDescription', event.target.value)}
                  rows={3}
                  maxLength={320}
                  className="field resize-y text-[0.84rem]"
                />
                {errors.shortDescription ? (
                  <p className="mt-1.5 text-[0.72rem] text-red-300">{errors.shortDescription}</p>
                ) : null}
              </div>

              <div>
                <label htmlFor="service-description" className="label">
                  Full description
                </label>
                <textarea
                  id="service-description"
                  value={draft.description}
                  onChange={(event) => set('description', event.target.value)}
                  rows={5}
                  className="field resize-y text-[0.84rem]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="service-icon" className="label">
                    Icon
                  </label>
                  <select
                    id="service-icon"
                    value={draft.icon}
                    onChange={(event) => set('icon', event.target.value)}
                    className="field cursor-pointer text-[0.8rem]"
                  >
                    {ICON_NAMES.map((name) => (
                      <option key={name} value={name} className="bg-[#0b0b10]">
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="service-order" className="label">
                    Order
                  </label>
                  <input
                    id="service-order"
                    type="number"
                    min={0}
                    max={9999}
                    value={draft.order}
                    onChange={(event) => set('order', Number(event.target.value))}
                    className="field text-[0.84rem]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="service-features" className="label">
                  Features
                </label>
                <textarea
                  id="service-features"
                  value={draft.featuresText}
                  onChange={(event) => set('featuresText', event.target.value)}
                  rows={4}
                  className="field resize-y text-[0.84rem]"
                  placeholder={'One feature per line'}
                />
                <p className="mt-1.5 text-[0.68rem] text-ink-faint">One feature per line.</p>
              </div>

              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5">
                <span>
                  <span className="block text-[0.8rem] font-medium text-white">Published</span>
                  <span className="block text-[0.66rem] text-ink-faint">
                    Visible on the services page
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={draft.published}
                  onChange={(event) => set('published', event.target.checked)}
                  className="h-4 w-4 accent-[#ff79ee]"
                />
              </label>
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary mt-4 w-full">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Save className="h-4 w-4" aria-hidden />
              )}
              {saving ? 'Saving…' : draft.id ? 'Save changes' : 'Create service'}
            </button>
          </form>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.015] p-6 text-center">
            <p className="text-[0.86rem] font-medium text-white">Select a service to edit</p>
            <p className="mt-1.5 text-[0.78rem] leading-relaxed text-ink-muted">
              Choose a service from the list, or create a new one.
            </p>
            <button type="button" onClick={openNew} className="btn btn-secondary mt-4">
              <Plus className="h-4 w-4" aria-hidden /> New service
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
