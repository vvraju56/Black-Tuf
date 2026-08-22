import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listCustomers } from '@/lib/admin-api';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Users, Search } from 'lucide-react';

export const AdminCustomers = () => {
  const { data: customers = [], isLoading } = useQuery({ queryKey: ['admin-customers'], queryFn: listCustomers });
  const [search, setSearch] = useState('');

  const filtered = (customers as any[]).filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${c.name || ''} ${c.email || ''}`.toLowerCase().includes(q);
  });

  if (isLoading) return <div className="container mx-auto py-16">Loading customers…</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Admin Customers</h1>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Email Verified</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c._id} className="border-t border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 font-medium">{c.name || 'N/A'}</td>
                <td className="px-4 py-3">{c.email}</td>
                <td className="px-4 py-3">{c.phone || '—'}</td>
                <td className="px-4 py-3">
                  <Badge variant={c.isActive ? 'success' : 'danger'}>{c.isActive ? 'Active' : 'Suspended'}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={c.emailVerified ? 'success' : 'warning'}>{c.emailVerified ? 'Verified' : 'Unverified'}</Badge>
                </td>
                <td className="px-4 py-3">{c.createdAt ? formatDate(c.createdAt) : '—'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No customers found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCustomers;
