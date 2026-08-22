"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  markAllNotificationsSeen,
  markNotificationSeen,
  unreadNotifications,
} from "@/services/notifications";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (userId: string) => [...notificationKeys.all, "list", userId] as const,
  unread: (userId: string) => [...notificationKeys.all, "unread", userId] as const,
};

export function useNotifications(userId: string | undefined) {
  return useQuery({
    queryKey: notificationKeys.list(userId ?? ""),
    queryFn: () => getNotifications(userId!),
    enabled: !!userId,
  });
}

export function useUnreadNotifications(userId: string | undefined) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: notificationKeys.unread(userId ?? ""),
    queryFn: () => unreadNotifications(userId!),
    enabled: !!userId,
    refetchInterval: 30_000,
  });

  const markSeen = useMutation({
    mutationFn: (id: string) => markNotificationSeen(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread(userId ?? "") });
      queryClient.invalidateQueries({ queryKey: notificationKeys.list(userId ?? "") });
    },
  });

  const markAll = useMutation({
    mutationFn: () => markAllNotificationsSeen(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread(userId ?? "") });
      queryClient.invalidateQueries({ queryKey: notificationKeys.list(userId ?? "") });
    },
  });

  return { ...query, markSeen, markAll };
}

export function useMarkAllNotifications(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsSeen(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread(userId ?? "") });
      queryClient.invalidateQueries({ queryKey: notificationKeys.list(userId ?? "") });
    },
  });
}
