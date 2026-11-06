import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  FolderTree,
  LifeBuoy,
  Mail,
  Package,
  Plus,
  Settings,
  Star,
  Wrench,
} from 'lucide-react';
import { AdminCard, AdminEmpty, AdminPageHeader, StatCard } from '@/components/admin/AdminUI';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { adminGet } from '@/lib/admin-server';
import type {
  AdminStats,
  ContactMessage,
  Product,
  ProductNotificationItem,
  Service,
  SupportRequest,
} from '@/lib/types';
import { excerpt, formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [stats, messages, support, products, notifications, services] = await Promise.all([
    adminGet<AdminStats>('/api/admin/stats'),
    adminGet<ContactMessage[]>('/api/admin/messages?status=new'),
    adminGet<SupportRequest[]>('/api/admin/support-requests?status=new'),
    adminGet<Product[]>('/api/admin/products'),
    adminGet<ProductNotificationItem[]>('/api/admin/notifications'),
    adminGet<Service[]>('/api/admin/services'),
  ]);

  const productList = products || [];
  const drafts = productList.filter((product) => !product.published);
  const featured = productList.filter((product) => product.featured);
  const serviceList = services || [];
  const publishedServices = serviceList.filter((service) => service.published).length;
  const unpublishedServices = serviceList.length - publishedServices;

  return (
    <>
      <AdminPageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="A live summary of the product catalogue and the inboxes that need attention."
        actions={
          <>
            <Link href="/admin/products/new" className="btn btn-primary">
              <Plus className="h-4 w-4" aria-hidden /> New product
            </Link>
            <Link href="/" className="btn btn-secondary">
              View site <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </>
        }
      />

      {!stats ? (
        <div className="mb-6 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] px-4 py-3 text-[0.82rem] text-amber-200">
          Admin statistics could not be loaded. Check that the API is running and reachable.
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Products"
          value={stats?.products ?? productList.length}
          hint={`${stats?.published ?? productList.filter((p) => p.published).length} published`}
          icon={<Package className="h-4 w-4" aria-hidden />}
          href="/admin/products"
        />
        <StatCard
          label="Featured"
          value={stats?.featured ?? featured.length}
          hint="Shown on the homepage"
          icon={<Star className="h-4 w-4" aria-hidden />}
          href="/admin/products?filter=featured"
        />
        <StatCard
          label="New messages"
          value={stats?.newMessages ?? (messages || []).length}
          hint={`${stats?.messages ?? 0} total`}
          icon={<Mail className="h-4 w-4" aria-hidden />}
          href="/admin/messages"
        />
        <StatCard
          label="Open support"
          value={stats?.openSupport ?? (support || []).length}
          hint={`${stats?.supportRequests ?? 0} total`}
          icon={<LifeBuoy className="h-4 w-4" aria-hidden />}
          href="/admin/support"
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Services"
          value={stats?.services ?? serviceList.length}
          hint={`${publishedServices} published`}
          icon={<Wrench className="h-4 w-4" aria-hidden />}
          href="/admin/services"
        />
        <StatCard
          label="Launch signups"
          value={stats?.notifications ?? (notifications || []).length}
          hint="Coming-soon notifications"
          icon={<Bell className="h-4 w-4" aria-hidden />}
          href="/admin/notifications"
        />
        <StatCard
          label="Drafts"
          value={drafts.length}
          hint="Not visible on the site"
          icon={<FolderTree className="h-4 w-4" aria-hidden />}
          href="/admin/products?filter=drafts"
        />
        <StatCard
          label="Unpublished services"
          value={unpublishedServices}
          hint="Hidden from the public site"
          icon={<Settings className="h-4 w-4" aria-hidden />}
          href="/admin/services"
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <AdminCard
          title="New contact messages"
          description="The most recent enquiries submitted through the contact form."
          actions={
            <Link
              href="/admin/messages"
              className="inline-flex items-center gap-1 text-[0.74rem] font-medium text-accent-soft hover:text-white"
            >
              Open inbox <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          }
        >
          {messages?.length ? (
            <ul className="divide-y divide-white/[0.07]">
              {messages.slice(0, 5).map((message) => (
                <li key={message.id}>
                  <Link
                    href={`/admin/messages?open=${message.id}`}
                    className="block py-3 transition-colors hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-[0.84rem] font-medium text-white">
                        {message.subject}
                      </p>
                      <span className="shrink-0 text-[0.66rem] text-ink-faint">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[0.72rem] text-ink-muted">
                      {message.name} · {message.email}
                    </p>
                    <p className="mt-1 line-clamp-1 text-[0.74rem] text-ink-faint">
                      {excerpt(message.message, 110)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <AdminEmpty
              title="No new messages"
              description="New enquiries will appear here as they arrive."
            />
          )}
        </AdminCard>

        <AdminCard
          title="Open support requests"
          description="Requests that have not been resolved or archived."
          actions={
            <Link
              href="/admin/support"
              className="inline-flex items-center gap-1 text-[0.74rem] font-medium text-accent-soft hover:text-white"
            >
              Open queue <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          }
        >
          {support?.length ? (
            <ul className="divide-y divide-white/[0.07]">
              {support.slice(0, 5).map((request) => (
                <li key={request.id}>
                  <Link
                    href={`/admin/support?open=${request.id}`}
                    className="block py-3 transition-colors hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-[0.84rem] font-medium text-white">
                        {request.issueType}
                        {request.productName ? ` · ${request.productName}` : ''}
                      </p>
                      <span className="shrink-0 text-[0.66rem] text-ink-faint">
                        {formatDate(request.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[0.72rem] text-ink-muted">
                      {request.name} · {request.email}
                    </p>
                    <p className="mt-1 line-clamp-1 text-[0.74rem] text-ink-faint">
                      {excerpt(request.message, 110)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <AdminEmpty
              title="No open support requests"
              description="New support requests will appear here."
            />
          )}
        </AdminCard>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <AdminCard
          title="Recent products"
          description="Every product in the catalogue, published or draft."
          actions={
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1 text-[0.74rem] font-medium text-accent-soft hover:text-white"
            >
              Manage products <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          }
        >
          {productList.length ? (
            <ul className="divide-y divide-white/[0.07]">
              {[...productList]
                .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
                .slice(0, 6)
                .map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="flex items-center gap-3 py-3 transition-colors hover:bg-white/[0.02]"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[0.66rem] font-bold text-accent-soft">
                        {product.name.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-[0.84rem] font-medium text-white">
                            {product.name}
                          </span>
                          {product.featured ? (
                            <Star className="h-3 w-3 shrink-0 text-accent" aria-label="Featured" />
                          ) : null}
                        </span>
                        <span className="mt-0.5 block truncate text-[0.7rem] text-ink-faint">
                          {product.categoryName} ·{' '}
                          {product.published ? 'Published' : 'Draft'} · updated{' '}
                          {formatDate(product.updatedAt)}
                        </span>
                      </span>
                      <StatusBadge status={product.status} />
                    </Link>
                  </li>
                ))}
            </ul>
          ) : (
            <AdminEmpty
              title="No products yet"
              description="Create your first product to populate the public directory."
              action={
                <Link href="/admin/products/new" className="btn btn-primary">
                  <Plus className="h-4 w-4" aria-hidden /> New product
                </Link>
              }
            />
          )}
        </AdminCard>

        <AdminCard title="Quick actions" description="Jump straight to the common tasks.">
          <div className="grid gap-2">
            {[
              { href: '/admin/products/new', label: 'Create a product', icon: Plus },
              { href: '/admin/services', label: 'Edit services', icon: Wrench },
              { href: '/admin/categories', label: 'Manage categories', icon: FolderTree },
              { href: '/admin/company', label: 'Update company info', icon: Settings },
              { href: '/admin/notifications', label: 'View launch signups', icon: Bell },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-[0.8rem] text-ink-muted transition-colors hover:border-accent/25 hover:text-white"
                >
                  <Icon className="h-4 w-4 text-accent/80" aria-hidden />
                  {item.label}
                  <ArrowRight className="ml-auto h-3.5 w-3.5" aria-hidden />
                </Link>
              );
            })}
          </div>
        </AdminCard>
      </div>
    </>
  );
}
