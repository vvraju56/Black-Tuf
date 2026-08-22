"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import {
  addSkill,
  deleteExperience,
  deletePortfolioProject,
  getDomains,
  getExperience,
  getPortfolioProjects,
  getProfileById,
  getProfileCompletion,
  getProfileDomains,
  getProfileReviews,
  getPublicProfileById,
  getPublicProfileByUsername,
  getPublicSkills,
  getMySkills,
  removeSkill,
  reorderSkills,
  setPortfolioOrder,
  setProfileDomains,
  updateOwnProfile,
  upsertExperience,
  upsertPortfolioProject,
} from "@/services/profile-v2";
import type { ExperienceItem, PortfolioProject } from "@/types";

export const profileKeys = {
  all: ["profile-v2"] as const,
  profile: (id: string) => [...profileKeys.all, "profile", id] as const,
  ownProfile: (id: string) => [...profileKeys.all, "own-profile", id] as const,
  completion: (id: string) => [...profileKeys.all, "completion", id] as const,
  skills: (id: string) => [...profileKeys.all, "skills", id] as const,
  domains: (id: string) => [...profileKeys.all, "domains", id] as const,
  portfolio: (id: string) => [...profileKeys.all, "portfolio", id] as const,
  experience: (id: string) => [...profileKeys.all, "experience", id] as const,
  reviews: (id: string) => [...profileKeys.all, "reviews", id] as const,
  domainsCatalog: () => [...profileKeys.all, "domains-catalog"] as const,
};

function useMe() {
  const { user } = useAuth();
  return user?.id ?? "";
}

// ---- Profile ----
export function useProfile(userId: string) {
  return useQuery({
    queryKey: profileKeys.profile(userId),
    queryFn: () => getPublicProfileById(userId),
    enabled: !!userId,
  });
}

export function useOwnProfile(userId: string) {
  return useQuery({
    queryKey: profileKeys.ownProfile(userId),
    queryFn: () => getProfileById(userId),
    enabled: !!userId,
  });
}

export function usePublicProfileByUsername(username: string) {
  return useQuery({
    queryKey: profileKeys.profile(username),
    queryFn: () => getPublicProfileByUsername(username),
    enabled: !!username,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (patch: Parameters<typeof updateOwnProfile>[0]) => updateOwnProfile(patch),
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: profileKeys.profile(user.id) });
        queryClient.invalidateQueries({ queryKey: profileKeys.ownProfile(user.id) });
        queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
        queryClient.invalidateQueries({ queryKey: profileKeys.completion(user.id) });
      }
    },
  });
}

// ---- Completion ----
export function useProfileCompletion(userId: string) {
  return useQuery({
    queryKey: profileKeys.completion(userId),
    queryFn: () => getProfileCompletion(userId),
    enabled: !!userId,
  });
}

// ---- Reviews ----
export function useProfileReviews(userId: string) {
  return useQuery({
    queryKey: profileKeys.reviews(userId),
    queryFn: () => getProfileReviews(userId),
    enabled: !!userId,
  });
}

// ---- Skills ----
export function useMySkills() {
  const userId = useMe();
  return useQuery({
    queryKey: profileKeys.skills(userId),
    queryFn: () => getMySkills(),
    enabled: !!userId,
  });
}

export function usePublicSkills(userId: string) {
  return useQuery({
    queryKey: profileKeys.skills(userId),
    queryFn: () => getPublicSkills(userId),
    enabled: !!userId,
  });
}

export function useAddSkill() {
  const queryClient = useQueryClient();
  const userId = useMe();
  return useMutation({
    mutationFn: (name: string) => addSkill(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.skills(userId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.completion(userId) });
    },
  });
}

export function useRemoveSkill() {
  const queryClient = useQueryClient();
  const userId = useMe();
  return useMutation({
    mutationFn: (skillId: string) => removeSkill(skillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.skills(userId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.completion(userId) });
    },
  });
}

export function useReorderSkills() {
  const queryClient = useQueryClient();
  const userId = useMe();
  return useMutation({
    mutationFn: (ids: string[]) => reorderSkills(ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKeys.skills(userId) }),
  });
}

// ---- Domains ----
export function useDomains() {
  return useQuery({
    queryKey: profileKeys.domainsCatalog(),
    queryFn: getDomains,
  });
}

export function useProfileDomains(userId: string) {
  return useQuery({
    queryKey: profileKeys.domains(userId),
    queryFn: () => getProfileDomains(userId),
    enabled: !!userId,
  });
}

export function useSetProfileDomains() {
  const queryClient = useQueryClient();
  const userId = useMe();
  return useMutation({
    mutationFn: (domainIds: string[]) => setProfileDomains(domainIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.domains(userId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.completion(userId) });
    },
  });
}

// ---- Portfolio ----
export function usePortfolioProjects(userId: string) {
  return useQuery({
    queryKey: profileKeys.portfolio(userId),
    queryFn: () => getPortfolioProjects(userId),
    enabled: !!userId,
  });
}

export function useUpsertPortfolioProject() {
  const queryClient = useQueryClient();
  const userId = useMe();
  return useMutation({
    mutationFn: (input: Partial<PortfolioProject>) => upsertPortfolioProject(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKeys.portfolio(userId) }),
  });
}

export function useDeletePortfolioProject() {
  const queryClient = useQueryClient();
  const userId = useMe();
  return useMutation({
    mutationFn: (id: string) => deletePortfolioProject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKeys.portfolio(userId) }),
  });
}

export function useSetPortfolioOrder() {
  const queryClient = useQueryClient();
  const userId = useMe();
  return useMutation({
    mutationFn: (ids: string[]) => setPortfolioOrder(ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKeys.portfolio(userId) }),
  });
}

// ---- Experience ----
export function useExperience(userId: string) {
  return useQuery({
    queryKey: profileKeys.experience(userId),
    queryFn: () => getExperience(userId),
    enabled: !!userId,
  });
}

export function useUpsertExperience() {
  const queryClient = useQueryClient();
  const userId = useMe();
  return useMutation({
    mutationFn: (input: Partial<ExperienceItem>) => upsertExperience(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKeys.experience(userId) }),
  });
}

export function useDeleteExperience() {
  const queryClient = useQueryClient();
  const userId = useMe();
  return useMutation({
    mutationFn: (id: string) => deleteExperience(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKeys.experience(userId) }),
  });
}
