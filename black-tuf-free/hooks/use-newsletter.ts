"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllSubscribers, removeSubscriber, subscribeToNewsletter } from "@/services/newsletter";
import { toast } from "sonner";

export const newsletterKeys = {
  all: ["newsletter"] as const,
  list: () => [...newsletterKeys.all, "list"] as const,
};

export function useSubscribeNewsletter() {
  return useMutation({
    mutationFn: (email: string) => subscribeToNewsletter(email),
    onSuccess: (res) => {
      if (res.ok) toast.success(res.message);
      else toast.error(res.message);
    },
  });
}

export function useNewsletterSubscribers() {
  return useQuery({ queryKey: newsletterKeys.list(), queryFn: getAllSubscribers });
}

export function useRemoveSubscriber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeSubscriber(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsletterKeys.list() });
    },
  });
}
