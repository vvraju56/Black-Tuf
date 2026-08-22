"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getFeedback, getFeedbackForProject, submitFeedback } from "@/services/feedback";

export const feedbackKeys = {
  all: ["feedback"] as const,
  list: () => [...feedbackKeys.all, "list"] as const,
  project: (id: string) => [...feedbackKeys.all, "project", id] as const,
};

export function useFeedback() {
  return useQuery({ queryKey: feedbackKeys.list(), queryFn: () => getFeedback() });
}

export function useProjectFeedback(projectId: string) {
  return useQuery({
    queryKey: feedbackKeys.project(projectId),
    queryFn: () => getFeedbackForProject(projectId),
    enabled: !!projectId,
  });
}

export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitFeedback,
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.project(vars.project_id) });
      queryClient.invalidateQueries({ queryKey: feedbackKeys.list() });
    },
  });
}