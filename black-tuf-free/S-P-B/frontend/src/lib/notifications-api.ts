import api from '@/lib/api';

export interface AppNotification {
  _id: string;
  recipient: string;
  recipientType: 'user' | 'seller';
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

export const fetchNotifications = async (): Promise<AppNotification[]> => {
  const { data } = await api.get('/notifications');
  return data.data.notifications || [];
};

export const fetchUnreadCount = async (): Promise<number> => {
  const { data } = await api.get('/notifications/unread-count');
  return data.data.count || 0;
};

export const markNotificationRead = async (id: string) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = async () => api.patch('/notifications/read-all');
