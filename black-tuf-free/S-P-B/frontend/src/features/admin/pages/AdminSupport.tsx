import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { listSupportTickets, assignTicket, respondTicketAdmin } from '@/lib/admin-api';
import { SupportTicket } from '@/lib/support-api';
import { timeAgo, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from 'react-hot-toast';
import { LifeBuoy, UserCheck, Send } from 'lucide-react';

const statusVariant = (s: string): 'success' | 'danger' | 'warning' | 'secondary' => {
  const map: Record<string, any> = {
    open: 'warning',
    in_progress: 'warning',
    waiting: 'secondary',
    resolved: 'success',
    closed: 'secondary',
  };
  return map[s] || 'secondary';
};

const priorityVariant = (p: string): 'danger' | 'warning' | 'secondary' =>
  p === 'urgent' ? 'danger' : p === 'high' ? 'warning' : 'secondary';

const statuses = ['open', 'in_progress', 'waiting', 'resolved', 'closed'];

export const AdminSupport = () => {
  const qc = useQueryClient();
  const { data: tickets = [], isLoading } = useQuery({ queryKey: ['admin-support-tickets'], queryFn: listSupportTickets });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [replyStatus, setReplyStatus] = useState('');

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-support-tickets'] });

  const assignMutation = useMutation({
    mutationFn: (id: string) => assignTicket(id),
    onSuccess: () => { toast.success('Ticket assigned'); invalidate(); },
    onError: () => toast.error('Failed to assign ticket'),
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, message, status }: { id: string; message: string; status?: string }) => respondTicketAdmin(id, message, status || undefined),
    onSuccess: () => {
      toast.success('Reply sent');
      setReply('');
      setReplyStatus('');
      invalidate();
    },
    onError: () => toast.error('Failed to send reply'),
  });

  const activeTicket = (tickets as SupportTicket[]).find((t) => t._id === activeId) || null;

  if (isLoading) return <div className="container mx-auto py-16">Loading support tickets…</div>;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <LifeBuoy className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Admin Support</h1>
      </div>

      {activeTicket && (
        <div className="mb-8 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-semibold">{activeTicket.subject}</p>
              <p className="text-xs text-muted-foreground">
                #{activeTicket.ticketId} · {activeTicket.category} · {activeTicket.createdBy?.name || 'N/A'} · created {timeAgo(activeTicket.createdAt)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={priorityVariant(activeTicket.priority)}>{activeTicket.priority}</Badge>
              <Badge variant={statusVariant(activeTicket.status)}>{activeTicket.status.replace(/_/g, ' ')}</Badge>
            </div>
          </div>

          <p className="rounded-lg bg-white/5 p-3 text-sm">{activeTicket.description || 'No description'}</p>

          <div className="mt-4 space-y-3">
            {activeTicket.messages?.map((m, i) => (
              <div key={i} className={cn('max-w-[85%] rounded-lg px-3 py-2 text-sm', m.senderType === 'admin' ? 'bg-primary/15' : 'bg-white/5')}>
                <p className="mb-1 text-xs capitalize text-muted-foreground">{m.senderType} · {timeAgo(m.createdAt)}</p>
                <p>{m.message}</p>
              </div>
            ))}
          </div>

          {!activeTicket.assignedTo && (
            <div className="mt-4">
              <Button size="sm" variant="outline" onClick={() => assignMutation.mutate(activeTicket._id)} loading={assignMutation.isPending}>
                <UserCheck className="mr-1 h-4 w-4" />Assign to me
              </Button>
            </div>
          )}

          {!['resolved', 'closed'].includes(activeTicket.status) && (
            <div className="mt-4 space-y-3">
              <Textarea label="Reply" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type your reply…" rows={3} />
              <div className="flex flex-wrap items-end gap-3">
                <div className="w-full max-w-[200px]">
                  <Select label="Set status (optional)" value={replyStatus} onChange={(e) => setReplyStatus(e.target.value)}>
                    <option value="">Keep current</option>
                    {statuses.map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </Select>
                </div>
                <Button onClick={() => respondMutation.mutate({ id: activeTicket._id, message: reply, status: replyStatus })} disabled={!reply.trim()} loading={respondMutation.isPending}>
                  <Send className="mr-1 h-4 w-4" />Send
                </Button>
              </div>
            </div>
          )}

          <button className="mt-3 text-xs text-primary hover:underline" onClick={() => setActiveId(null)}>Back to list</button>
        </div>
      )}

      <div className="space-y-2">
        {(tickets as SupportTicket[]).map((t) => (
          <button
            key={t._id}
            onClick={() => setActiveId(t._id)}
            className={cn(
              'flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10',
              activeId === t._id && 'border-primary/40'
            )}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{t.subject}</p>
              <p className="text-xs text-muted-foreground">
                #{t.ticketId} · {t.category} · {t.createdBy?.name || 'N/A'} · {timeAgo(t.createdAt)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant={priorityVariant(t.priority)}>{t.priority}</Badge>
              <Badge variant={statusVariant(t.status)}>{t.status.replace(/_/g, ' ')}</Badge>
            </div>
          </button>
        ))}
        {tickets.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center text-muted-foreground">No support tickets found</div>
        )}
      </div>
    </div>
  );
};

export default AdminSupport;
