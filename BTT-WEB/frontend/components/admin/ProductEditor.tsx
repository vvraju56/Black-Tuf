'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import { AdminNotice } from '@/components/admin/AdminUI';
import { BrandImage } from '@/components/ui/BrandImage';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { adminRequest, AdminApiError, adminUpload, fieldErrorsToMap } from '@/lib/admin';
import { ICON_NAMES } from '@/lib/icons';
import type { Category, Product, ProductStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const STATUSES: ProductStatus[] = ['Active', 'Beta', 'Coming Soon', 'Maintenance', 'Archived'];
const PRICING: { value: string; label: string }[] = [
  { value: '', label: 'Not specified' },
  { value: 'Free', label: 'Free' },
  { value: 'Freemium', label: 'Freemium' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Custom', label: 'Custom' },
  { value: 'Coming Soon', label: 'Coming Soon' },
];

type FeatureRow = { key: string; icon: string; title: string; description: string };
type ScreenshotRow = { key: string; url: string; alt: string; caption: string };
type FaqRow = { key: string; question: string; answer: string };
type StepRow = { key: string; title: string; description: string };
type ChangelogRow = { key: string; version: string; releaseDate: string; notes: string };

function uid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

interface EditorState {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  category: string;
  status: ProductStatus;
  websiteUrl: string;
  githubUrl: string;
  documentationUrl: string;
  supportUrl: string;
  version: string;
  releaseDate: string;
  pricingType: string;
  pricingNote: string;
  howItWorks: StepRow[];
  features: FeatureRow[];
  screenshots: ScreenshotRow[];
  technologiesText: string;
  faqs: FaqRow[];
  changelog: ChangelogRow[];
  featured: boolean;
  published: boolean;
  order: number;
  seoTitle: string;
  seoDescription: string;
}

function toState(product: Product | null): EditorState {
  if (!product) {
    return {
      name: '',
      slug: '',
      shortDescription: '',
      description: '',
      logoUrl: '',
      bannerUrl: '',
      category: '',
      status: 'Coming Soon',
      websiteUrl: '',
      githubUrl: '',
      documentationUrl: '',
      supportUrl: '',
      version: '',
      releaseDate: '',
      pricingType: '',
      pricingNote: '',
      howItWorks: [],
      features: [],
      screenshots: [],
      technologiesText: '',
      faqs: [],
      changelog: [],
      featured: false,
      published: false,
      order: 0,
      seoTitle: '',
      seoDescription: '',
    };
  }

  return {
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    description: product.description,
    logoUrl: product.logo,
    bannerUrl: product.bannerImage,
    category: product.category?.id || '',
    status: product.status,
    websiteUrl: product.websiteUrl,
    githubUrl: product.githubUrl,
    documentationUrl: product.documentationUrl,
    supportUrl: product.supportUrl,
    version: product.version,
    releaseDate: product.releaseDate,
    pricingType: product.pricing?.type || '',
    pricingNote: product.pricing?.note || '',
    howItWorks: product.howItWorks.map((step) => ({ key: uid(), ...step })),
    features: product.features.map((feature) => ({
      key: feature.id,
      icon: feature.icon,
      title: feature.title,
      description: feature.description,
    })),
    screenshots: product.screenshots.map((shot) => ({
      key: shot.id,
      url: shot.url,
      alt: shot.alt,
      caption: shot.caption,
    })),
    technologiesText: product.technologies.map((technology) => technology.name).join(', '),
    faqs: product.faqs.map((faq) => ({
      key: faq.id,
      question: faq.question,
      answer: faq.answer,
    })),
    changelog: product.changelog.map((entry) => ({
      key: entry.id,
      version: entry.version,
      releaseDate: entry.releaseDate,
      notes: entry.notes.join('\n'),
    })),
    featured: product.featured,
    published: product.published,
    order: product.order,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
  };
}

function Section({
  title,
  description,
  children,
  id,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  id: string;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6"
    >
      <div className="mb-4">
        <h2 className="text-[0.98rem] font-semibold text-white">{title}</h2>
        {description ? <p className="mt-1 text-[0.78rem] text-ink-muted">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  htmlFor?: string;
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

function RowShell({
  index,
  label,
  onRemove,
  children,
}: {
  index: number;
  label: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
          {label} {index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md p-1 text-ink-faint transition-colors hover:bg-red-400/10 hover:text-red-300"
          aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function ProductEditor({
  product,
  categories,
}: {
  product: Product | null;
  categories: Category[];
}) {
  const router = useRouter();
  const [state, setState] = useState<EditorState>(() => toState(product));
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<'logo' | 'banner' | 'screenshot' | null>(null);
  const logoInput = useRef<HTMLInputElement>(null);
  const bannerInput = useRef<HTMLInputElement>(null);
  const screenshotInput = useRef<HTMLInputElement>(null);

  const set = <K extends keyof EditorState>(key: K, value: EditorState[K]) => {
    setState((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key as string]) return current;
      const next = { ...current };
      delete next[key as string];
      return next;
    });
  };

  const updateRow = <T extends { key: string }>(
    key: 'features' | 'screenshots' | 'faqs' | 'howItWorks' | 'changelog',
    rowKey: string,
    patch: Partial<T>
  ) => {
    setState((current) => ({
      ...current,
      [key]: (current[key] as unknown as T[]).map((row) =>
        row.key === rowKey ? { ...row, ...patch } : row
      ),
    }));
  };

  const removeRow = (
    key: 'features' | 'screenshots' | 'faqs' | 'howItWorks' | 'changelog',
    rowKey: string
  ) => {
    setState((current) => ({
      ...current,
      [key]: (current[key] as unknown as { key: string }[]).filter((row) => row.key !== rowKey),
    }));
  };

  const previewName = state.name || 'Product name';
  const previewCategory =
    categories.find((category) => category.id === state.category)?.name || 'Category';

  const previewDescription = useMemo(
    () => state.shortDescription || 'A short description will appear here.',
    [state.shortDescription]
  );

  const handleName = (value: string) => {
    set('name', value);
    if (!slugTouched) set('slug', slugify(value));
  };

  const upload = async (file: File, kind: 'logo' | 'banner' | 'screenshot') => {
    setUploading(kind);
    setMessage('');
    try {
      const uploaded = await adminUpload(file, kind);
      if (kind === 'logo') set('logoUrl', uploaded.url);
      else if (kind === 'banner') set('bannerUrl', uploaded.url);
      else {
        setState((current) => ({
          ...current,
          screenshots: [
            ...current.screenshots,
            {
              key: uid(),
              url: uploaded.url,
              alt: '',
              caption: '',
            },
          ],
        }));
      }
      setNotice('Image uploaded.');
    } catch (error) {
      setMessage(
        error instanceof AdminApiError
          ? error.message
          : 'Upload failed. Check Cloudinary configuration on the API.'
      );
    } finally {
      setUploading(null);
    }
  };

  const buildPayload = () => ({
    name: state.name.trim(),
    slug: state.slug.trim(),
    shortDescription: state.shortDescription.trim(),
    description: state.description.trim(),
    logoUrl: state.logoUrl.trim(),
    bannerUrl: state.bannerUrl.trim(),
    category: state.category,
    status: state.status,
    websiteUrl: state.websiteUrl.trim(),
    githubUrl: state.githubUrl.trim(),
    documentationUrl: state.documentationUrl.trim(),
    supportUrl: state.supportUrl.trim(),
    version: state.version.trim(),
    releaseDate: state.releaseDate,
    pricingType: state.pricingType,
    pricingNote: state.pricingNote.trim(),
    howItWorks: state.howItWorks
      .filter((row) => row.title.trim())
      .map((row) => ({ title: row.title.trim(), description: row.description.trim() })),
    features: state.features
      .filter((row) => row.title.trim())
      .map((row) => ({
        icon: row.icon,
        title: row.title.trim(),
        description: row.description.trim(),
      })),
    screenshots: state.screenshots
      .filter((row) => row.url.trim())
      .map((row) => ({
        url: row.url.trim(),
        alt: row.alt.trim(),
        caption: row.caption.trim(),
      })),
    technologies: state.technologiesText
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter(Boolean),
    faqs: state.faqs
      .filter((row) => row.question.trim() && row.answer.trim())
      .map((row) => ({ question: row.question.trim(), answer: row.answer.trim() })),
    changelog: state.changelog
      .filter((row) => row.version.trim())
      .map((row) => ({
        version: row.version.trim(),
        releaseDate: row.releaseDate,
        notes: row.notes
          .split('\n')
          .map((note) => note.trim())
          .filter(Boolean),
      })),
    featured: state.featured,
    published: state.published,
    order: Number(state.order) || 0,
    seoTitle: state.seoTitle.trim(),
    seoDescription: state.seoDescription.trim(),
  });

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setNotice('');
    setErrors({});

    const localErrors: Record<string, string> = {};
    if (state.name.trim().length < 2) localErrors.name = 'Add a product name.';
    if (state.shortDescription.trim().length < 10)
      localErrors.shortDescription = 'Add a short description of at least 10 characters.';
    if (!state.category) localErrors.category = 'Choose a category.';
    if (Object.keys(localErrors).length) {
      setErrors(localErrors);
      setMessage('Please fix the highlighted fields.');
      setSaving(false);
      return;
    }

    try {
      const payload = buildPayload();
      const saved = await adminRequest<Product>(
        product ? `/admin/products/${product.id}` : '/admin/products',
        {
          method: product ? 'PUT' : 'POST',
          body: JSON.stringify(payload),
        }
      );
      setNotice('Product saved.');
      if (!product) {
        router.replace(`/admin/products/${saved.id}`);
      }
      router.refresh();
    } catch (error) {
      if (error instanceof AdminApiError) {
        setErrors(fieldErrorsToMap(error.fieldErrors));
        setMessage(error.message);
      } else {
        setMessage('Could not save the product. Try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const errorFor = (key: string) => errors[key];

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Link
            href="/admin/products"
            className="mb-2 inline-flex items-center gap-1.5 text-[0.74rem] text-ink-muted transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> All products
          </Link>
          <h1 className="font-display text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
            {product ? product.name : 'New product'}
          </h1>
          <p className="mt-1.5 text-[0.82rem] text-ink-muted">
            {product
              ? `Editing /products/${product.slug}`
              : 'Create a draft first, then publish when the details are ready.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {product?.published ? (
            <Link
              href={`/products/${product.slug}`}
              target="_blank"
              className="btn btn-secondary"
            >
              View live page
            </Link>
          ) : null}
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Save className="h-4 w-4" aria-hidden />
            )}
            {saving ? 'Saving…' : 'Save product'}
          </button>
        </div>
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

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="space-y-5">
          <Section
            id="identity"
            title="Identity"
            description="The name and copy shown at the top of the product page."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Product name" htmlFor="product-name" error={errorFor('name')}>
                <input
                  id="product-name"
                  value={state.name}
                  onChange={(event) => handleName(event.target.value)}
                  className="field"
                  placeholder="Makeable Jobs"
                />
              </Field>
              <Field
                label="Slug"
                htmlFor="product-slug"
                hint="Lowercase letters, numbers, and hyphens. Used in the URL."
                error={errorFor('slug')}
              >
                <input
                  id="product-slug"
                  value={state.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    set('slug', slugify(event.target.value));
                  }}
                  className="field font-mono text-[0.82rem]"
                  placeholder="makeable-jobs"
                />
              </Field>
            </div>

            <div className="mt-4">
              <Field
                label="Short description"
                htmlFor="product-short"
                hint="One or two sentences. Shown on cards and product hero."
                error={errorFor('shortDescription')}
              >
                <textarea
                  id="product-short"
                  value={state.shortDescription}
                  onChange={(event) => set('shortDescription', event.target.value)}
                  rows={3}
                  maxLength={320}
                  className="field resize-y"
                />
              </Field>
            </div>

            <div className="mt-4">
              <Field
                label="Full description"
                htmlFor="product-description"
                hint="Separate paragraphs with a blank line."
                error={errorFor('description')}
              >
                <textarea
                  id="product-description"
                  value={state.description}
                  onChange={(event) => set('description', event.target.value)}
                  rows={8}
                  className="field resize-y"
                />
              </Field>
            </div>
          </Section>

          <Section
            id="media"
            title="Media"
            description="Logo and banner. Use Cloudinary uploads or paste a URL."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
                <p className="label">Logo</p>
                <div className="flex items-center gap-3">
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#0b0b10]">
                    {state.logoUrl ? (
                      <BrandImage
                        src={state.logoUrl}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-contain p-1.5"
                      />
                    ) : (
                      <ImagePlus className="h-5 w-5 text-ink-faint" aria-hidden />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <input
                      value={state.logoUrl}
                      onChange={(event) => set('logoUrl', event.target.value)}
                      className="field h-9 text-[0.76rem]"
                      placeholder="/products/logo.png or https://…"
                      aria-label="Logo URL"
                    />
                    <input
                      ref={logoInput}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/avif"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) upload(file, 'logo');
                        event.target.value = '';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => logoInput.current?.click()}
                      disabled={uploading !== null}
                      className="inline-flex items-center gap-1.5 text-[0.72rem] font-medium text-accent-soft hover:text-white disabled:opacity-50"
                    >
                      {uploading === 'logo' ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                      ) : (
                        <Upload className="h-3.5 w-3.5" aria-hidden />
                      )}
                      Upload image
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-[0.64rem] text-ink-faint">Square image recommended.</p>
              </div>

              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
                <p className="label">Banner</p>
                <div className="flex items-center gap-3">
                  <div className="relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#0b0b10]">
                    {state.bannerUrl ? (
                      <BrandImage
                        src={state.bannerUrl}
                        alt=""
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <ImagePlus className="h-5 w-5 text-ink-faint" aria-hidden />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <input
                      value={state.bannerUrl}
                      onChange={(event) => set('bannerUrl', event.target.value)}
                      className="field h-9 text-[0.76rem]"
                      placeholder="Banner URL"
                      aria-label="Banner URL"
                    />
                    <input
                      ref={bannerInput}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/avif"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) upload(file, 'banner');
                        event.target.value = '';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => bannerInput.current?.click()}
                      disabled={uploading !== null}
                      className="inline-flex items-center gap-1.5 text-[0.72rem] font-medium text-accent-soft hover:text-white disabled:opacity-50"
                    >
                      {uploading === 'banner' ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                      ) : (
                        <Upload className="h-3.5 w-3.5" aria-hidden />
                      )}
                      Upload image
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-[0.64rem] text-ink-faint">Wide image, at least 1200px.</p>
              </div>
            </div>
          </Section>

          <Section
            id="features"
            title="Features"
            description="Short capability cards. Titles are required for each row you keep."
          >
            <div className="space-y-3">
              {state.features.map((feature, index) => (
                <RowShell
                  key={feature.key}
                  index={index}
                  label="Feature"
                  onRemove={() => removeRow('features', feature.key)}
                >
                  <div className="grid gap-3 sm:grid-cols-[10rem_minmax(0,1fr)]">
                    <Field label="Icon">
                      <select
                        value={feature.icon}
                        onChange={(event) =>
                          updateRow<FeatureRow>('features', feature.key, {
                            icon: event.target.value,
                          })
                        }
                        className="field h-9 cursor-pointer text-[0.78rem]"
                      >
                        {ICON_NAMES.map((name) => (
                          <option key={name} value={name} className="bg-[#0b0b10]">
                            {name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Title">
                      <input
                        value={feature.title}
                        onChange={(event) =>
                          updateRow<FeatureRow>('features', feature.key, {
                            title: event.target.value,
                          })
                        }
                        className="field h-9 text-[0.82rem]"
                      />
                    </Field>
                  </div>
                  <Field label="Description">
                    <textarea
                      value={feature.description}
                      onChange={(event) =>
                        updateRow<FeatureRow>('features', feature.key, {
                          description: event.target.value,
                        })
                      }
                      rows={2}
                      className="field resize-y text-[0.82rem]"
                    />
                  </Field>
                </RowShell>
              ))}
              <button
                type="button"
                onClick={() =>
                  setState((current) => ({
                    ...current,
                    features: [
                      ...current.features,
                      { key: uid(), icon: 'Sparkles', title: '', description: '' },
                    ],
                  }))
                }
                className="btn btn-secondary w-full"
              >
                <Plus className="h-4 w-4" aria-hidden /> Add feature
              </button>
            </div>
          </Section>

          <Section
            id="how-it-works"
            title="How it works"
            description="An ordered explanation of the product workflow."
          >
            <div className="space-y-3">
              {state.howItWorks.map((step, index) => (
                <RowShell
                  key={step.key}
                  index={index}
                  label="Step"
                  onRemove={() => removeRow('howItWorks', step.key)}
                >
                  <Field label="Title">
                    <input
                      value={step.title}
                      onChange={(event) =>
                        updateRow<StepRow>('howItWorks', step.key, { title: event.target.value })
                      }
                      className="field h-9 text-[0.82rem]"
                    />
                  </Field>
                  <Field label="Description">
                    <textarea
                      value={step.description}
                      onChange={(event) =>
                        updateRow<StepRow>('howItWorks', step.key, {
                          description: event.target.value,
                        })
                      }
                      rows={2}
                      className="field resize-y text-[0.82rem]"
                    />
                  </Field>
                </RowShell>
              ))}
              <button
                type="button"
                onClick={() =>
                  setState((current) => ({
                    ...current,
                    howItWorks: [
                      ...current.howItWorks,
                      { key: uid(), title: '', description: '' },
                    ],
                  }))
                }
                className="btn btn-secondary w-full"
              >
                <Plus className="h-4 w-4" aria-hidden /> Add step
              </button>
            </div>
          </Section>

          <Section
            id="screenshots"
            title="Screenshots"
            description="Real product screenshots only. Uploaded images are stored in Cloudinary."
          >
            <div className="space-y-3">
              {state.screenshots.map((shot, index) => (
                <RowShell
                  key={shot.key}
                  index={index}
                  label="Screenshot"
                  onRemove={() => removeRow('screenshots', shot.key)}
                >
                  <div className="flex gap-3">
                    <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#0b0b10]">
                      {shot.url ? (
                        <BrandImage
                          src={shot.url}
                          alt=""
                          fill
                          sizes="128px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <input
                        value={shot.url}
                        onChange={(event) =>
                          updateRow<ScreenshotRow>('screenshots', shot.key, {
                            url: event.target.value,
                          })
                        }
                        className="field h-9 text-[0.76rem]"
                        placeholder="Screenshot URL"
                        aria-label={`Screenshot ${index + 1} URL`}
                      />
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input
                          value={shot.alt}
                          onChange={(event) =>
                            updateRow<ScreenshotRow>('screenshots', shot.key, {
                              alt: event.target.value,
                            })
                          }
                          className="field h-9 text-[0.76rem]"
                          placeholder="Alt text"
                          aria-label={`Screenshot ${index + 1} alt text`}
                        />
                        <input
                          value={shot.caption}
                          onChange={(event) =>
                            updateRow<ScreenshotRow>('screenshots', shot.key, {
                              caption: event.target.value,
                            })
                          }
                          className="field h-9 text-[0.76rem]"
                          placeholder="Caption"
                          aria-label={`Screenshot ${index + 1} caption`}
                        />
                      </div>
                    </div>
                  </div>
                </RowShell>
              ))}

              <input
                ref={screenshotInput}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) upload(file, 'screenshot');
                  event.target.value = '';
                }}
              />
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => screenshotInput.current?.click()}
                  disabled={uploading !== null}
                  className="btn btn-secondary flex-1"
                >
                  {uploading === 'screenshot' ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Upload className="h-4 w-4" aria-hidden />
                  )}
                  Upload screenshot
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setState((current) => ({
                      ...current,
                      screenshots: [
                        ...current.screenshots,
                        { key: uid(), url: '', alt: '', caption: '' },
                      ],
                    }))
                  }
                  className="btn btn-secondary flex-1"
                >
                  <Plus className="h-4 w-4" aria-hidden /> Add by URL
                </button>
              </div>
            </div>
          </Section>

          <Section
            id="faqs"
            title="FAQs"
            description="Optional. Questions appear in an accordion on the product page."
          >
            <div className="space-y-3">
              {state.faqs.map((faq, index) => (
                <RowShell
                  key={faq.key}
                  index={index}
                  label="FAQ"
                  onRemove={() => removeRow('faqs', faq.key)}
                >
                  <Field label="Question">
                    <input
                      value={faq.question}
                      onChange={(event) =>
                        updateRow<FaqRow>('faqs', faq.key, { question: event.target.value })
                      }
                      className="field h-9 text-[0.82rem]"
                    />
                  </Field>
                  <Field label="Answer">
                    <textarea
                      value={faq.answer}
                      onChange={(event) =>
                        updateRow<FaqRow>('faqs', faq.key, { answer: event.target.value })
                      }
                      rows={3}
                      className="field resize-y text-[0.82rem]"
                    />
                  </Field>
                </RowShell>
              ))}
              <button
                type="button"
                onClick={() =>
                  setState((current) => ({
                    ...current,
                    faqs: [...current.faqs, { key: uid(), question: '', answer: '' }],
                  }))
                }
                className="btn btn-secondary w-full"
              >
                <Plus className="h-4 w-4" aria-hidden /> Add FAQ
              </button>
            </div>
          </Section>

          <Section
            id="changelog"
            title="Changelog"
            description="Release notes shown on the product page. One note per line."
          >
            <div className="space-y-3">
              {state.changelog.map((entry, index) => (
                <RowShell
                  key={entry.key}
                  index={index}
                  label="Release"
                  onRemove={() => removeRow('changelog', entry.key)}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Version">
                      <input
                        value={entry.version}
                        onChange={(event) =>
                          updateRow<ChangelogRow>('changelog', entry.key, {
                            version: event.target.value,
                          })
                        }
                        className="field h-9 text-[0.82rem]"
                        placeholder="1.0.0"
                      />
                    </Field>
                    <Field label="Release date">
                      <input
                        type="date"
                        value={entry.releaseDate}
                        onChange={(event) =>
                          updateRow<ChangelogRow>('changelog', entry.key, {
                            releaseDate: event.target.value,
                          })
                        }
                        className="field h-9 text-[0.82rem]"
                      />
                    </Field>
                  </div>
                  <Field label="Notes">
                    <textarea
                      value={entry.notes}
                      onChange={(event) =>
                        updateRow<ChangelogRow>('changelog', entry.key, {
                          notes: event.target.value,
                        })
                      }
                      rows={4}
                      className="field resize-y text-[0.82rem]"
                      placeholder={'Added saved searches\nImproved performance'}
                    />
                  </Field>
                </RowShell>
              ))}
              <button
                type="button"
                onClick={() =>
                  setState((current) => ({
                    ...current,
                    changelog: [
                      ...current.changelog,
                      { key: uid(), version: '', releaseDate: '', notes: '' },
                    ],
                  }))
                }
                className="btn btn-secondary w-full"
              >
                <Plus className="h-4 w-4" aria-hidden /> Add release
              </button>
            </div>
          </Section>
        </div>

        <div className="space-y-5">
          <div className="sticky top-24 space-y-5">
            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
              <h2 className="text-[0.95rem] font-semibold text-white">Publishing</h2>
              <div className="mt-4 space-y-4">
                <Field label="Category" htmlFor="product-category" error={errorFor('category')}>
                  <select
                    id="product-category"
                    value={state.category}
                    onChange={(event) => set('category', event.target.value)}
                    className="field cursor-pointer"
                  >
                    <option value="" className="bg-[#0b0b10]">
                      Choose a category…
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id} className="bg-[#0b0b10]">
                        {category.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Status" htmlFor="product-status">
                  <select
                    id="product-status"
                    value={state.status}
                    onChange={(event) => set('status', event.target.value as ProductStatus)}
                    className="field cursor-pointer"
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status} className="bg-[#0b0b10]">
                        {status}
                      </option>
                    ))}
                  </select>
                </Field>

                <div className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5">
                  <div>
                    <p className="text-[0.8rem] font-medium text-white">Published</p>
                    <p className="text-[0.66rem] text-ink-faint">Visible on the public site</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={state.published}
                    onClick={() => set('published', !state.published)}
                    className={cn(
                      'relative h-6 w-11 shrink-0 rounded-full border transition-colors',
                      state.published
                        ? 'border-accent/50 bg-accent/30'
                        : 'border-white/15 bg-white/[0.06]'
                    )}
                    aria-label="Toggle published"
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 h-4 w-4 rounded-full transition-all',
                        state.published ? 'left-[1.45rem] bg-accent' : 'left-0.5 bg-ink-faint'
                      )}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5">
                  <div>
                    <p className="text-[0.8rem] font-medium text-white">Featured</p>
                    <p className="text-[0.66rem] text-ink-faint">Prioritise on the homepage</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={state.featured}
                    onClick={() => set('featured', !state.featured)}
                    className={cn(
                      'relative h-6 w-11 shrink-0 rounded-full border transition-colors',
                      state.featured
                        ? 'border-accent/50 bg-accent/30'
                        : 'border-white/15 bg-white/[0.06]'
                    )}
                    aria-label="Toggle featured"
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 h-4 w-4 rounded-full transition-all',
                        state.featured ? 'left-[1.45rem] bg-accent' : 'left-0.5 bg-ink-faint'
                      )}
                    />
                  </button>
                </div>

                <Field label="Sort order" htmlFor="product-order" hint="Lower numbers appear first.">
                  <input
                    id="product-order"
                    type="number"
                    min={0}
                    max={9999}
                    value={state.order}
                    onChange={(event) => set('order', Number(event.target.value))}
                    className="field"
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
              <h2 className="text-[0.95rem] font-semibold text-white">Product links</h2>
              <p className="mt-1 text-[0.72rem] text-ink-faint">
                Empty links are hidden on the website.
              </p>
              <div className="mt-4 space-y-3">
                <Field label="Website URL" htmlFor="product-website" error={errorFor('websiteUrl')}>
                  <input
                    id="product-website"
                    type="url"
                    value={state.websiteUrl}
                    onChange={(event) => set('websiteUrl', event.target.value)}
                    className="field text-[0.8rem]"
                    placeholder="https://…"
                  />
                </Field>
                <Field label="Documentation URL" htmlFor="product-docs" error={errorFor('documentationUrl')}>
                  <input
                    id="product-docs"
                    type="url"
                    value={state.documentationUrl}
                    onChange={(event) => set('documentationUrl', event.target.value)}
                    className="field text-[0.8rem]"
                    placeholder="https://…"
                  />
                </Field>
                <Field label="GitHub URL" htmlFor="product-github" error={errorFor('githubUrl')}>
                  <input
                    id="product-github"
                    type="url"
                    value={state.githubUrl}
                    onChange={(event) => set('githubUrl', event.target.value)}
                    className="field text-[0.8rem]"
                    placeholder="https://…"
                  />
                </Field>
                <Field label="Support URL" htmlFor="product-support" error={errorFor('supportUrl')}>
                  <input
                    id="product-support"
                    type="url"
                    value={state.supportUrl}
                    onChange={(event) => set('supportUrl', event.target.value)}
                    className="field text-[0.8rem]"
                    placeholder="https://…"
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
              <h2 className="text-[0.95rem] font-semibold text-white">Details</h2>
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Version" htmlFor="product-version">
                    <input
                      id="product-version"
                      value={state.version}
                      onChange={(event) => set('version', event.target.value)}
                      className="field text-[0.8rem]"
                      placeholder="1.0.0"
                    />
                  </Field>
                  <Field label="Release date" htmlFor="product-release">
                    <input
                      id="product-release"
                      type="date"
                      value={state.releaseDate}
                      onChange={(event) => set('releaseDate', event.target.value)}
                      className="field text-[0.8rem]"
                    />
                  </Field>
                </div>
                <Field label="Pricing" htmlFor="product-pricing">
                  <select
                    id="product-pricing"
                    value={state.pricingType}
                    onChange={(event) => set('pricingType', event.target.value)}
                    className="field cursor-pointer text-[0.8rem]"
                  >
                    {PRICING.map((option) => (
                      <option key={option.value} value={option.value} className="bg-[#0b0b10]">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Pricing note" htmlFor="product-pricing-note">
                  <textarea
                    id="product-pricing-note"
                    value={state.pricingNote}
                    onChange={(event) => set('pricingNote', event.target.value)}
                    rows={2}
                    className="field resize-y text-[0.8rem]"
                  />
                </Field>
                <Field
                  label="Technologies"
                  htmlFor="product-technologies"
                  hint="Comma or newline separated."
                  error={errorFor('technologies')}
                >
                  <textarea
                    id="product-technologies"
                    value={state.technologiesText}
                    onChange={(event) => set('technologiesText', event.target.value)}
                    rows={3}
                    className="field resize-y text-[0.8rem]"
                    placeholder="Next.js, Node.js, MongoDB"
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
              <h2 className="text-[0.95rem] font-semibold text-white">SEO</h2>
              <div className="mt-4 space-y-3">
                <Field
                  label="SEO title"
                  htmlFor="product-seo-title"
                  hint={`${state.seoTitle.length}/70`}
                  error={errorFor('seoTitle')}
                >
                  <input
                    id="product-seo-title"
                    value={state.seoTitle}
                    onChange={(event) => set('seoTitle', event.target.value)}
                    maxLength={70}
                    className="field text-[0.8rem]"
                    placeholder={previewName}
                  />
                </Field>
                <Field
                  label="SEO description"
                  htmlFor="product-seo-description"
                  hint={`${state.seoDescription.length}/180`}
                  error={errorFor('seoDescription')}
                >
                  <textarea
                    id="product-seo-description"
                    value={state.seoDescription}
                    onChange={(event) => set('seoDescription', event.target.value)}
                    maxLength={180}
                    rows={3}
                    className="field resize-y text-[0.8rem]"
                    placeholder={previewDescription}
                  />
                </Field>
              </div>

              <div className="mt-4 rounded-xl border border-white/[0.07] bg-[#0b0b10] p-3">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                  Search preview
                </p>
                <p className="mt-2 truncate text-[0.76rem] text-emerald-300/80">
                  blacktuf.com › products › {state.slug || 'product-slug'}
                </p>
                <p className="mt-1 line-clamp-2 text-[0.88rem] font-medium text-sky-300">
                  {state.seoTitle || `${previewName} — BlackTuf Technologies`}
                </p>
                <p className="mt-1 line-clamp-2 text-[0.72rem] leading-relaxed text-ink-muted">
                  {state.seoDescription || previewDescription}
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
              <h2 className="text-[0.95rem] font-semibold text-white">Card preview</h2>
              <div className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-[#0b0b10]">
                    {state.logoUrl ? (
                      <BrandImage
                        src={state.logoUrl}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <span className="text-[0.66rem] font-bold text-accent-soft">
                        {previewName.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <StatusBadge status={state.status} />
                </div>
                <p className="mt-3 truncate text-[0.88rem] font-semibold text-white">{previewName}</p>
                <p className="mt-1 line-clamp-2 text-[0.74rem] leading-relaxed text-ink-muted">
                  {previewDescription}
                </p>
                <p className="mt-2 text-[0.66rem] text-ink-faint">{previewCategory}</p>
              </div>
            </section>

            <button type="submit" disabled={saving} className="btn btn-primary w-full">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Check className="h-4 w-4" aria-hidden />
              )}
              {saving ? 'Saving…' : 'Save product'}
            </button>
            <p className="text-center text-[0.66rem] text-ink-faint">
              <ChevronDown className="mr-1 inline h-3 w-3" aria-hidden />
              Changes go live after saving and revalidation.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
