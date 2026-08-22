"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getAccessibleProjects, updateProject } from "@/services/projects";
import { getAllProfiles, setUserRole } from "@/services/profile";
import { getVisits, updateVisit } from "@/services/visits";
import { getLatestMessages } from "@/services/messages";
import { getAllFeedback } from "@/services/feedback";
import { setFeedbackApproved } from "@/services/feedback";
import { getInvoices, createInvoice, updateInvoiceStatus, nextInvoiceNumber } from "@/services/invoices";
import { getAllNotifications } from "@/services/notifications";
import { listBucketFiles } from "@/services/storage";
import { getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } from "@/services/blog";
import { getQuoteRequests, updateQuoteStatus, deleteQuoteRequest, getBookings, updateBookingStatus, deleteBooking, getContactMessages, markContactRead, deleteContactMessage } from "@/services/leads";
import { getSiteSettings, saveSiteSettings } from "@/services/cms";
import { getAllServices, createService, updateService, deleteService } from "@/services/services";
import type { Profile, InvoiceStatus } from "@/types";

export const adminKeys = {
  projects: ["admin", "projects"] as const,
  users: ["admin", "users"] as const,
  services: ["admin", "services"] as const,
  visits: ["admin", "visits"] as const,
  messages: ["admin", "messages"] as const,
  feedback: ["admin", "feedback"] as const,
  invoices: ["admin", "invoices"] as const,
  notifications: ["admin", "notifications"] as const,
  storage: ["admin", "storage"] as const,
  blog: ["admin", "blog"] as const,
  quotes: ["admin", "quotes"] as const,
  bookings: ["admin", "bookings"] as const,
  contact: ["admin", "contact"] as const,
  settings: ["admin", "settings"] as const,
};

export function useAdminProjects() {
  return useQuery({ queryKey: adminKeys.projects, queryFn: getAccessibleProjects });
}

export function useAdminUsers() {
  return useQuery({ queryKey: adminKeys.users, queryFn: getAllProfiles });
}

export function useAdminVisits() {
  return useQuery({ queryKey: adminKeys.visits, queryFn: getVisits });
}

export function useAdminMessages() {
  return useQuery({ queryKey: adminKeys.messages, queryFn: () => getLatestMessages() });
}

export function useAdminFeedback() {
  return useQuery({ queryKey: adminKeys.feedback, queryFn: getAllFeedback });
}

export function useAdminInvoices() {
  return useQuery({ queryKey: adminKeys.invoices, queryFn: getInvoices });
}

export function useAdminNotifications() {
  return useQuery({ queryKey: adminKeys.notifications, queryFn: getAllNotifications });
}

export function useAdminStorage() {
  const buckets = ["avatars", "projectFiles", "quotations", "invoices"] as const;
  const avatars = useQuery({
    queryKey: [...adminKeys.storage, "avatars"],
    queryFn: () => listBucketFiles("avatars"),
  });
  const projectFiles = useQuery({
    queryKey: [...adminKeys.storage, "projectFiles"],
    queryFn: () => listBucketFiles("projectFiles"),
  });
  const quotations = useQuery({
    queryKey: [...adminKeys.storage, "quotations"],
    queryFn: () => listBucketFiles("quotations"),
  });
  const invoices = useQuery({
    queryKey: [...adminKeys.storage, "invoices"],
    queryFn: () => listBucketFiles("invoices"),
  });
  const queries = [avatars, projectFiles, quotations, invoices];
  return { buckets, queries };
}

export function useAssignEngineer(projectId: string) {
  const queryClient = useQueryClient();
  const mutate = (engineerId: string | null) =>
    updateProject(projectId, { engineer_id: engineerId });
  return {
    assign: (engineerId: string | null) =>
      mutate(engineerId).then(() => {
        queryClient.invalidateQueries({ queryKey: adminKeys.projects });
        queryClient.invalidateQueries({ queryKey: ["projects"] });
      }),
  };
}

export function useUpdateRole(userId: string) {
  const queryClient = useQueryClient();
  return {
    setRole: (role: Profile["role"]) =>
      setUserRole(userId, role).then(() => {
        queryClient.invalidateQueries({ queryKey: adminKeys.users });
      }),
  };
}

export function useUpdateVisitAdmin(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Parameters<typeof updateVisit>[1]) => updateVisit(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.visits });
      queryClient.invalidateQueries({ queryKey: ["visits", "list"] });
    },
  });
}

export function useApproveFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; approved: boolean }) =>
      setFeedbackApproved(vars.id, vars.approved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.feedback });
      queryClient.invalidateQueries({ queryKey: ["feedback", "list"] });
    },
  });
}

// ---------------------------------------------------------------
// Blog
// ---------------------------------------------------------------
export function useAdminBlog() {
  return useQuery({ queryKey: adminKeys.blog, queryFn: getBlogPosts });
}

export function useBlogPostMutation() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: adminKeys.blog });
  return {
    create: (input: Parameters<typeof createBlogPost>[0]) => createBlogPost(input).then(invalidate),
    update: (id: string, patch: Parameters<typeof updateBlogPost>[1]) => updateBlogPost(id, patch).then(invalidate),
    remove: (id: string) => deleteBlogPost(id).then(invalidate),
  };
}

// ---------------------------------------------------------------
// Leads: quotes, bookings, contact
// ---------------------------------------------------------------
export function useAdminQuotes() {
  return useQuery({ queryKey: adminKeys.quotes, queryFn: getQuoteRequests });
}

export function useQuoteMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: adminKeys.quotes });
  return {
    setStatus: (id: string, status: Parameters<typeof updateQuoteStatus>[1]) => updateQuoteStatus(id, status).then(invalidate),
    remove: (id: string) => deleteQuoteRequest(id).then(invalidate),
  };
}

export function useAdminBookings() {
  return useQuery({ queryKey: adminKeys.bookings, queryFn: getBookings });
}

export function useBookingMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: adminKeys.bookings });
  return {
    setStatus: (id: string, status: Parameters<typeof updateBookingStatus>[1]) => updateBookingStatus(id, status).then(invalidate),
    remove: (id: string) => deleteBooking(id).then(invalidate),
  };
}

export function useAdminContact() {
  return useQuery({ queryKey: adminKeys.contact, queryFn: getContactMessages });
}

export function useContactMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: adminKeys.contact });
  return {
    setRead: (id: string, read: boolean) => markContactRead(id, read).then(invalidate),
    remove: (id: string) => deleteContactMessage(id).then(invalidate),
  };
}

// ---------------------------------------------------------------
// Settings
// ---------------------------------------------------------------
export function useAdminSettings() {
  return useQuery({ queryKey: adminKeys.settings, queryFn: getSiteSettings });
}

export function useSaveSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveSiteSettings,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.settings }),
  });
}

// ---------------------------------------------------------------
// Services
// ---------------------------------------------------------------
export function useAdminServices() {
  return useQuery({ queryKey: adminKeys.services, queryFn: getAllServices });
}

export function useServiceMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: adminKeys.services });
  return {
    create: (input: Parameters<typeof createService>[0]) => createService(input).then(invalidate),
    update: (id: string, patch: Parameters<typeof updateService>[1]) => updateService(id, patch).then(invalidate),
    remove: (id: string) => deleteService(id).then(invalidate),
  };
}

// ---------------------------------------------------------------
// Invoices
// ---------------------------------------------------------------
export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.invoices });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useInvoiceStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; status: InvoiceStatus }) => updateInvoiceStatus(vars.id, vars.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.invoices });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useNextInvoiceNumber() {
  return useQuery({ queryKey: ["invoices", "next"], queryFn: nextInvoiceNumber });
}
