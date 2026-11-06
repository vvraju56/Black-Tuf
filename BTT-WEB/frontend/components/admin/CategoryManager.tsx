'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FolderTree, Loader2, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { AdminEmpty, AdminNotice } from '@/components/admin/AdminUI';
import { adminRequest, AdminApiError, fieldErrorsToMap } from '@/lib/admin';
import type { AdminCategory } from '@/lib/types';

type Draft = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  order: number;
};

const EMPTY: Draft = { name: '', slug: '', description: '', order: 0 };

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function CategoryManager({ initialCategories }: { initialCategories: AdminCategory[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
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

  const openEdit = (category: AdminCategory) => {
    setDraft({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      order: category.order,
    });
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

    if (draft.name.trim().length < 2) {
      setErrors({ name: 'Add a category name.' });
      setMessage('Please fix the highlighted fields.');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        name: draft.name.trim(),
        slug: draft.slug.trim(),
        description: draft.description.trim(),
        order: Number(draft.order) || 0,
      };
      const saved = await adminRequest<AdminCategory>(
        draft.id ? `/admin/categories/${draft.id}` : '/admin/categories',
        { method: draft.id ? 'PUT' : 'POST', body: JSON.stringify(payload) }
      );

      setCategories((current) => {
        if (draft.id) {
          return current.map((item) =>
            item.id === draft.id
              ? { ...item, ...payload, id: draft.id, slug: saved.slug || payload.slug }
              : item
          );
        }
        return [
          ...current,
          {
            ...saved,
            ...payload,
            id: saved.id,
            productCount: 0,
          },
        ];
      });
      setNotice(draft.id ? 'Category updated.' : 'Category created.');
      if (!draft.id) setDraft({ ...EMPTY });
      router.refresh();
    } catch (error) {
      if (error instanceof AdminApiError) {
        setErrors(fieldErrorsToMap(error.fieldErrors));
        setMessage(error.message);
      } else {
        setMessage('Could not save the category.');
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async (category: AdminCategory) => {
    if (
      !window.confirm(
        `Delete “${category.name}”? Categories used by products cannot be deleted until those products are moved.`
      )
    ) {
      return;
    }
    setBusy(category.id);
    setMessage('');
    setNotice('');
    try {
      await adminRequest(`/admin/categories/${category.id}`, { method: 'DELETE' });
      setCategories((current) => current.filter((item) => item.id !== category.id));
      if (draft?.id === category.id) setDraft(null);
      setNotice('Category deleted.');
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof AdminApiError ? error.message : 'Could not delete the category.'
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-[0.78rem] text-ink-muted">
            {categories.length} {categories.length === 1 ? 'category' : 'categories'}
          </p>
          <button type="button" onClick={openNew} className="btn btn-primary">
            <Plus className="h-4 w-4" aria-hidden /> New category
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

        {categories.length ? (
          <ul className="space-y-2.5">
            {[...categories]
              .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
              .map((category) => (
                <li
                  key={category.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-4"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent/[0.07] text-accent">
                      <FolderTree className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[0.9rem] font-semibold text-white">{category.name}</h3>
                        <span className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[0.6rem] text-ink-muted">
                          order {category.order}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[0.7rem] text-ink-faint">
                        /{category.slug} ·{' '}
                        {category.productCount}{' '}
                        {category.productCount === 1 ? 'product' : 'products'}
                      </p>
                      {category.description ? (
                        <p className="mt-1 line-clamp-1 text-[0.74rem] text-ink-muted">
                          {category.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEdit(category)}
                      className="rounded-md border border-white/10 bg-white/[0.04] p-1.5 text-ink-muted transition-colors hover:text-white"
                      aria-label={`Edit ${category.name}`}
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(category)}
                      disabled={busy === category.id}
                      className="rounded-md border border-red-400/20 bg-red-400/[0.06] p-1.5 text-red-300 transition-colors hover:bg-red-400/15"
                      aria-label={`Delete ${category.name}`}
                    >
                      {busy === category.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      )}
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        ) : (
          <AdminEmpty
            title="No categories yet"
            description="Create at least one category before adding a product."
            action={
              <button type="button" onClick={openNew} className="btn btn-primary">
                <Plus className="h-4 w-4" aria-hidden /> New category
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
                {draft.id ? 'Edit category' : 'New category'}
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
                <label htmlFor="category-name" className="label">
                  Name
                </label>
                <input
                  id="category-name"
                  value={draft.name}
                  onChange={(event) => {
                    const value = event.target.value;
                    set('name', value);
                    if (!slugTouched) set('slug', slugify(value));
                  }}
                  className="field text-[0.84rem]"
                />
                {errors.name ? (
                  <p className="mt-1.5 text-[0.72rem] text-red-300">{errors.name}</p>
                ) : null}
              </div>

              <div>
                <label htmlFor="category-slug" className="label">
                  Slug
                </label>
                <input
                  id="category-slug"
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
                <label htmlFor="category-description" className="label">
                  Description
                </label>
                <textarea
                  id="category-description"
                  value={draft.description}
                  onChange={(event) => set('description', event.target.value)}
                  rows={3}
                  maxLength={300}
                  className="field resize-y text-[0.84rem]"
                />
              </div>

              <div>
                <label htmlFor="category-order" className="label">
                  Order
                </label>
                <input
                  id="category-order"
                  type="number"
                  min={0}
                  max={9999}
                  value={draft.order}
                  onChange={(event) => set('order', Number(event.target.value))}
                  className="field text-[0.84rem]"
                />
                <p className="mt-1.5 text-[0.68rem] text-ink-faint">
                  Lower numbers appear first in filters.
                </p>
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary mt-4 w-full">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Save className="h-4 w-4" aria-hidden />
              )}
              {saving ? 'Saving…' : draft.id ? 'Save changes' : 'Create category'}
            </button>
          </form>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.015] p-6 text-center">
            <p className="text-[0.86rem] font-medium text-white">Select a category to edit</p>
            <p className="mt-1.5 text-[0.78rem] leading-relaxed text-ink-muted">
              Categories group products in the public directory.
            </p>
            <button type="button" onClick={openNew} className="btn btn-secondary mt-4">
              <Plus className="h-4 w-4" aria-hidden /> New category
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
