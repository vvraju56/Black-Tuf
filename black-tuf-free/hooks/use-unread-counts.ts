"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/client";
import { unreadMessageCount } from "@/services/messages";
import { unreadNotifications } from "@/services/notifications";
import { useAuth } from "@/hooks/use-auth";

export function useUnreadCounts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id ?? "";

  const messages = useQuery({
    queryKey: ["unread-messages", userId],
    queryFn: () => unreadMessageCount(userId),
    enabled: !!userId,
    refetchInterval: 30_000,
  });

  const notifications = useQuery({
    queryKey: ["unread-notifications", userId],
    queryFn: () => unreadNotifications(userId),
    enabled: !!userId,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (!userId) return;
    const client = supabase();
    const topic = `unread-realtime-${userId}-${Date.now()}`;
    const ch = client.channel(topic);
    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ["unread-messages", userId] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications", userId] });
    };
    ch.on("postgres_changes", { event: "*", schema: "public", table: "messages" }, invalidate);
    ch.on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, invalidate);
    ch.subscribe();
    return () => {
      client.removeChannel(ch);
    };
  }, [queryClient, userId]);

  return {
    messages: messages.data ?? 0,
    notifications: notifications.data ?? 0,
    isLoading: messages.isLoading || notifications.isLoading,
  };
}
