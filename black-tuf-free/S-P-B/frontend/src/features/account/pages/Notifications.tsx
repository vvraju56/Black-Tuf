import { Link } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, AppNotification } from '@/lib/notifications-api';
import { timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Bell, BellRing, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const typeIcons: Record<string, React.ReactNode> = {
  order_update: <span className="h-2.5 w-2.5 rounded-full bg-primary" />,
  payment_update: <span className="h-2.5 w-2.5 rounded-full bg-success" />,
  return_update: <span className="h-2.5 w-2.5 rounded-full bg-accent" />,
  support_update: <span className="h-2.5 w-2.5 rounded-full bg-secondary" />,
};

export const Notifications = () => {
  const queryClient = useQueryClient();
  const { data: notifications = [], isLoading } = useQuery({ queryKey: ['notifications'], queryFn: fetchNotifications, staleTime: 30000 });

  const readMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const readAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unread = notifications.filter((n) => !n.isRead).length;

  if (isLoading) return <div className="container mx-auto py-16">Loading notifications…</div>;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={() => readAllMutation.mutate()}>
            <CheckCheck className="mr-1 h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center">
          <Bell className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">You’re all caught up — no notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: AppNotification) => (
            <button
              key={n._id}
              onClick={() => !n.isRead && readMutation.mutate(n._id)}
              className={cn(
                'flex w-full items-start gap-3 rounded-xl border border-white/10 p-4 text-left transition hover:bg-white/5',
                !n.isRead && 'bg-primary/5'
              )}
            >
              <span className="mt-1">{typeIcons[n.type] || typeIcons.order_update}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{n.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(n.createdAt)}</span>
                </span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{n.message}</span>
              </span>
              {!n.isRead && <BellRing className="mt-1 h-4 w-4 shrink-0 text-primary" />}
            </button>
          ))}
        </div>
      )}

      <p className="mt-8 text-sm text-muted-foreground">
        Need help? <Link to="/support" className="text-primary hover:underline">Contact support</Link>.
      </p>
    </div>
  );
};

export default Notifications;
