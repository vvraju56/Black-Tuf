import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { fetchTickets, createTicket, respondTicket, closeTicket, SupportTicket } from '@/lib/support-api';
import { timeAgo, cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { toast } from 'react-hot-toast';
import { LifeBuoy, MessageSquarePlus } from 'lucide-react';

const categories = ['general', 'order', 'payment', 'product', 'account', 'technical'];

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    open: 'bg-success/10 text-success',
    in_progress: 'bg-primary/10 text-primary',
    waiting: 'bg-accent/10 text-accent-foreground',
    resolved: 'bg-secondary/10 text-secondary-foreground',
    closed: 'bg-muted text-muted-foreground',
  };
  return map[s] || 'bg-muted text-muted-foreground';
};

export const Support = () => {
  const queryClient = useQueryClient();
  const { data: tickets = [], isLoading } = useQuery({ queryKey: ['support-tickets'], queryFn: fetchTickets, staleTime: 30000 });

  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reply, setReply] = useState('');

  const createMutation = useMutation({
    mutationFn: () => createTicket({ subject, description, category, priority }),
    onSuccess: () => {
      toast.success('Ticket created');
      setShowForm(false);
      setSubject(''); setDescription(''); setCategory('general'); setPriority('medium');
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
    onError: () => toast.error('Failed to create ticket'),
  });

  const replyMutation = useMutation({
    mutationFn: () => respondTicket(activeId!, reply),
    onSuccess: () => { setReply(''); toast.success('Reply sent'); queryClient.invalidateQueries({ queryKey: ['support-tickets'] }); },
    onError: () => toast.error('Failed to send reply'),
  });

  const closeMutation = useMutation({
    mutationFn: () => closeTicket(activeId!),
    onSuccess: () => { toast.success('Ticket closed'); queryClient.invalidateQueries({ queryKey: ['support-tickets'] }); },
    onError: () => toast.error('Failed to close ticket'),
  });

  const activeTicket = tickets.find((t) => t._id === activeId) || null;

  if (isLoading) return <div className="container mx-auto py-16">Loading tickets…</div>;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          <MessageSquarePlus className="mr-1 h-4 w-4" /> New Ticket
        </Button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="mb-4 font-semibold">Create a ticket</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief summary of the issue" />
            </div>
            <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </Select>
            <Select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
              {['low', 'medium', 'high', 'urgent'].map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </Select>
            <div className="sm:col-span-2">
              <Textarea label="Description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue in detail" />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button onClick={() => createMutation.mutate()} loading={createMutation.isPending}>Submit</Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {activeTicket && (
        <div className="mb-8 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-semibold">{activeTicket.subject}</p>
              <p className="text-xs text-muted-foreground">#{activeTicket.ticketId} · {activeTicket.category} · created {timeAgo(activeTicket.createdAt)}</p>
            </div>
            <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', statusBadge(activeTicket.status))}>
              {activeTicket.status.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="space-y-3">
            {activeTicket.messages?.map((m, i) => (
              <div key={i} className={cn('max-w-[85%] rounded-lg px-3 py-2 text-sm', m.senderType === 'admin' ? 'bg-primary/15' : 'bg-white/5')}>
                <p className="text-xs text-muted-foreground mb-1 capitalize">{m.senderType} · {timeAgo(m.createdAt)}</p>
                <p>{m.message}</p>
              </div>
            ))}
          </div>
          {!['resolved', 'closed'].includes(activeTicket.status) && (
            <div className="mt-4 flex gap-3">
              <Input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type a reply…" />
              <Button onClick={() => replyMutation.mutate()} loading={replyMutation.isPending} disabled={!reply.trim()}>Send</Button>
              <Button variant="outline" onClick={() => closeMutation.mutate()}>Close</Button>
            </div>
          )}
          <button className="mt-3 text-xs text-primary hover:underline" onClick={() => setActiveId(null)}>Back to list</button>
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center">
          <LifeBuoy className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">No tickets yet. Create one and we’ll help right away.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map((t: SupportTicket) => (
            <button key={t._id} onClick={() => setActiveId(t._id)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{t.subject}</p>
                <p className="text-xs text-muted-foreground">#{t.ticketId} · {t.category} · {timeAgo(t.createdAt)}</p>
              </div>
              <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', statusBadge(t.status))}>
                {t.status.replace(/_/g, ' ')}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Support;
