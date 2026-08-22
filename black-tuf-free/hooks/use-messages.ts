"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMessages,
  markMessagesRead,
  sendMessage,
  setTyping,
  clearTyping,
  getTyping,
  getLatestMessages,
} from "@/services/messages";

export const messageKeys = {
  all: ["messages"] as const,
  project: (id: string) => [...messageKeys.all, "project", id] as const,
  typing: (id: string) => [...messageKeys.all, "typing", id] as const,
};

export function useMessages(projectId: string) {
  return useQuery({
    queryKey: messageKeys.project(projectId),
    queryFn: () => getMessages(projectId),
    enabled: !!projectId,
  });
}

export function useSendMessage(projectId: string, senderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof sendMessage>[2]) =>
      sendMessage(projectId, senderId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.project(projectId) });
    },
  });
}

export function useMarkRead(projectId: string, userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markMessagesRead(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.project(projectId) });
    },
  });
}

export function useTyping(projectId: string, userId: string) {
  const queryClient = useQueryClient();

  const start = () => setTyping(projectId, userId);
  const stop = () => clearTyping(projectId, userId);

  return {
    start,
    stop,
    typingUsers: useQuery({
      queryKey: messageKeys.typing(projectId),
      queryFn: () => getTyping(projectId),
      enabled: !!projectId,
      refetchInterval: 5000,
    }),
    invalidate: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.typing(projectId) });
    },
  };
}

export function useLatestMessages() {
  return useQuery({
    queryKey: messageKeys.all,
    queryFn: () => getLatestMessages(200),
  });
}
