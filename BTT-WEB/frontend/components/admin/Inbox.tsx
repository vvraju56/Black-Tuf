'use client';

import { useMemo, useState } from 'react';
import {
  Archive,
  CheckCheck,
  Clock,
  Eye,
  Inbox,
  Loader2,
  Mail,
  MessageSquareReply,
  Paperclip,
  Search,
  Trash2,
} from 'lucide-react';
import { AdminEmpty, AdminNotice } from '@/components/admin/AdminUI';
import { adminRequest, AdminApiError } from '@/lib/admin';
import { cn, excerpt, formatDate } from '@/lib/utils';

export interface InboxRecord {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  meta: { label: string; value: string }[];
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface InboxStatus {
  value: string;
  label: string;
  icon?: 'new' | 'read' | 'replied' | 'progress' | 'resolved' | 'archive';
}

const STATUS_ICONS = {
  new: Clock,
  read: Eye,
  replied: MessageSquareReply,
  progress: Loader2,
  resolved: CheckCheck,
  archive: Archive,
} as const;

export function statusTone(status: string) {
  switch (status) {
    case 'new':
      return 'border-accent/30 bg-accent/10 text-accent-soft';
    case 'read':
      return 'border-sky-400/25 bg-sky-400/10 text-sky-300';
    case 'replied':
    case 'resolved':
      return 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300';
    case 'in_progress':
      return 'border-amber-400/25 bg-amber-400/10 text-amber-300';
    case 'archived':
      return 'border-white/12 bg-white/[0.05] text-ink-faint';
    default:
      return 'border-white/12 bg-white/[0.05] text-ink-muted';
  }
}

function StatusPill({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.62rem] font-semibold capitalize',
        statusTone(status)
      )}
    >
      {label}
    </span>
  );
}

export function InboxView({
  records,
  statuses,
  endpoint,
  initialOpenId,
  emptyTitle,
  emptyDescription,
  replyPrefix = 'Re:',
}: {
  records: InboxRecord[];
  statuses: InboxStatus[];
  endpoint: string;
  initialOpenId?: string;
  emptyTitle: string;
  emptyDescription: string;
  replyPrefix?: string;
}) {
  const [items, setItems] = useState(records);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(
    initialOpenId && records.some((item) => item.id === initialOpenId)
      ? initialOpenId
      : (records[0]?.id ?? null)
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: items.length };
    for (const status of statuses) {
      map[status.value] = items.filter((item) => item.status === status.value).length;
    }
    return map;
  }, [items, statuses]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (
        q &&
        !`${item.name} ${item.email} ${item.subject} ${item.message} ${item.meta
          .map((entry) => entry.value)
          .join(' ')}`
          .toLowerCase()
          .includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [items, statusFilter, search]);

  const selected = items.find((item) => item.id === selectedId) || null;

  const updateStatus = async (item: InboxRecord, status: string) => {
    setBusy(item.id);
    setError('');
    setNotice('');
    try {
      await adminRequest(`${endpoint}/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setItems((current) =>
        current.map((entry) => (entry.id === item.id ? { ...entry, status } : entry))
      );
      setNotice(`Status updated to ${status.replace('_', ' ')}.`);
    } catch (requestError) {
      setError(
        requestError instanceof AdminApiError
          ? requestError.message
          : 'Could not update this record.'
      );
    } finally {
      setBusy(null);
    }
  };

  const remove = async (item: InboxRecord) => {
    if (
      !window.confirm(
        `Delete the ${item.subject} from ${item.name}? This permanently removes the record and cannot be undone.`
      )
    ) {
      return;
    }
    setBusy(item.id);
    setError('');
    setNotice('');
    try {
      await adminRequest(`${endpoint}/${item.id}`, { method: 'DELETE' });
      setItems((current) => {
        const next = current.filter((entry) => entry.id !== item.id);
        if (selectedId === item.id) setSelectedId(next[0]?.id ?? null);
        return next;
      });
      setNotice('Record deleted.');
    } catch (requestError) {
      setError(
        requestError instanceof AdminApiError
          ? requestError.message
          : 'Could not delete this record.'
      );
    } finally {
      setBusy(null);
    }
  };

  const statusLabel = (status: string) =>
    statuses.find((entry) => entry.value === status)?.label || status.replace('_', ' ');

  const detail = (item: InboxRecord) => (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/[0.07] pb-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={item.status} label={statusLabel(item.status)} />
            <span className="text-[0.68rem] text-ink-faint">
              {formatDate(item.createdAt, {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
          </div>
          <h2 className="mt-2 text-[1.02rem] font-semibold text-white">{item.subject}</h2>
          <p className="mt-1 text-[0.78rem] text-ink-muted">
            {item.name} ·{' '}
            <a href={`mailto:${item.email}`} className="text-accent-soft hover:text-white">
              {item.email}
            </a>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <a
            href={`mailto:${item.email}?subject=${encodeURIComponent(`${replyPrefix} ${item.subject}`)}`}
            className="btn btn-secondary h-8 px-2.5 py-0 text-[0.7rem]"
          >
            <Mail className="h-3.5 w-3.5" aria-hidden /> Reply
          </a>
          <button
            type="button"
            onClick={() => remove(item)}
            disabled={busy === item.id}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-400/20 bg-red-400/[0.06] px-2.5 text-[0.7rem] font-semibold text-red-300 transition-colors hover:bg-red-400/15"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete
          </button>
        </div>
      </div>

      {item.meta.some((entry) => entry.value) ? (
        <dl className="grid gap-3 border-b border-white/[0.07] py-4 sm:grid-cols-2">
          {item.meta
            .filter((entry) => entry.value)
            .map((entry) => (
              <div key={entry.label}>
                <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                  {entry.label}
                </dt>
                <dd className="mt-0.5 break-words text-[0.82rem] text-white">{entry.value}</dd>
              </div>
            ))}
        </dl>
      ) : null}

      <div className="py-4">
        <p className="whitespace-pre-wrap break-words text-[0.86rem] leading-relaxed text-ink">
          {item.message}
        </p>
      </div>

      {item.attachmentUrl ? (
        <a
          href={item.attachmentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-white/[0.09] bg-white/[0.03] px-3 py-2 text-[0.78rem] text-accent-soft transition-colors hover:border-accent/30 hover:text-white"
        >
          <Paperclip className="h-3.5 w-3.5" aria-hidden />
          {item.attachmentName || 'View attachment'}
        </a>
      ) : null}

      <div className="mt-5 border-t border-white/[0.07] pt-4">
        <p className="mb-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
          Update status
        </p>
        <div className="flex flex-wrap gap-1.5">
          {statuses.map((status) => {
            const Icon = STATUS_ICONS[status.icon || 'read'];
            const active = item.status === status.value;
            return (
              <button
                key={status.value}
                type="button"
                onClick={() => updateStatus(item, status.value)}
                disabled={busy === item.id || active}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[0.72rem] font-medium transition-colors',
                  active
                    ? 'border-accent/40 bg-accent/12 text-accent-soft'
                    : 'border-white/10 bg-white/[0.03] text-ink-muted hover:text-white disabled:opacity-50'
                )}
              >
                {busy === item.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : (
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                )}
                {status.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {error ? (
        <div className="mb-4">
          <AdminNotice type="error">{error}</AdminNotice>
        </div>
      ) : null}
      {notice ? (
        <div className="mb-4">
          <AdminNotice type="success">{notice}</AdminNotice>
        </div>
      ) : null}

      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 lg:flex-row lg:items-center">
        <label className="relative flex flex-1 items-center">
          <span className="sr-only">Search inbox</span>
          <Search
            className="pointer-events-none absolute left-3 h-4 w-4 text-ink-faint"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, subject, or content…"
            className="field h-10 pl-9 text-[0.82rem]"
          />
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={cn(
              'rounded-lg border px-2.5 py-1.5 text-[0.72rem] font-medium transition-colors',
              statusFilter === 'all'
                ? 'border-accent/40 bg-accent/12 text-accent-soft'
                : 'border-white/10 bg-white/[0.03] text-ink-muted hover:text-white'
            )}
          >
            All <span className="ml-1 text-[0.62rem] text-ink-faint">{counts.all}</span>
          </button>
          {statuses.map((status) => (
            <button
              key={status.value}
              type="button"
              onClick={() => setStatusFilter(status.value)}
              className={cn(
                'rounded-lg border px-2.5 py-1.5 text-[0.72rem] font-medium capitalize transition-colors',
                statusFilter === status.value
                  ? 'border-accent/40 bg-accent/12 text-accent-soft'
                  : 'border-white/10 bg-white/[0.03] text-ink-muted hover:text-white'
              )}
            >
              {status.label}
              <span className="ml-1 text-[0.62rem] text-ink-faint">
                {counts[status.value] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length ? (
        <div className="grid gap-4 lg:grid-cols-[23rem_minmax(0,1fr)]">
          <ul className="max-h-[calc(100vh-16rem)] space-y-2 overflow-y-auto pr-1">
            {filtered.map((item) => {
              const active = item.id === selectedId;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    aria-current={active ? 'true' : undefined}
                    className={cn(
                      'w-full rounded-xl border p-3.5 text-left transition-colors',
                      active
                        ? 'border-accent/35 bg-accent/[0.07]'
                        : 'border-white/[0.08] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[0.84rem] font-semibold text-white">
                        {item.name}
                      </span>
                      <span className="shrink-0 text-[0.62rem] text-ink-faint">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[0.74rem] text-accent-soft/90">
                      {item.subject}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[0.72rem] leading-relaxed text-ink-muted">
                      {excerpt(item.message, 130)}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <StatusPill status={item.status} label={statusLabel(item.status)} />
                      {item.attachmentUrl ? (
                        <span className="inline-flex items-center gap-1 text-[0.62rem] text-ink-faint">
                          <Paperclip className="h-3 w-3" aria-hidden /> Attachment
                        </span>
                      ) : null}
                    </div>
                  </button>

                  {active ? (
                    <div className="mt-2 rounded-xl border border-white/[0.08] bg-white/[0.025] p-4 lg:hidden">
                      {detail(item)}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <div className="hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6 lg:block">
            {selected ? (
              detail(selected)
            ) : (
              <AdminEmpty title="No record selected" description="Choose a record to read it." />
            )}
          </div>
        </div>
      ) : (
        <AdminEmpty
          title={items.length ? 'Nothing matches this view' : emptyTitle}
          description={
            items.length
              ? 'Change the filter or clear the search to see more records.'
              : emptyDescription
          }
          action={
            items.length ? (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all');
                  setSearch('');
                }}
                className="btn btn-secondary"
              >
                Clear filters
              </button>
            ) : (
              <span className="inline-flex items-center gap-2 text-[0.76rem] text-ink-faint">
                <Inbox className="h-4 w-4" aria-hidden /> Inbox is empty
              </span>
            )
          }
        />
      )}
    </div>
  );
}
