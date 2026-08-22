import { supabase } from "./client";
import type { Notification, NotificationType } from "@/types";

export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase()
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Notification[];
}

export async function getAllNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase()
    .from("notifications")
    .select("*, user:user_id(id, full_name, email, role)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Notification[];
}

export async function unreadNotifications(userId: string): Promise<number> {
  const { data, error } = await supabase()
    .from("notifications")
    .select("id")
    .eq("user_id", userId)
    .eq("seen", false);

  if (error) throw new Error(error.message);
  return data?.length ?? 0;
}

export async function markNotificationSeen(id: string) {
  const { error } = await supabase().from("notifications").update({ seen: true }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function markAllNotificationsSeen(userId: string) {
  const { error } = await supabase()
    .from("notifications")
    .update({ seen: true })
    .eq("user_id", userId)
    .eq("seen", false);

  if (error) throw new Error(error.message);
}

export async function createNotification(input: {
  user_id: string;
  title: string;
  body?: string;
  type?: NotificationType;
  project_id?: string | null;
  link?: string | null;
}) {
  const { error } = await supabase().from("notifications").insert({
    user_id: input.user_id,
    title: input.title,
    body: input.body ?? "",
    type: input.type ?? "system",
    project_id: input.project_id ?? null,
    link: input.link ?? null,
  });

  if (error) throw new Error(error.message);

  // Fire the FCM push alongside the in-app notification.
  void fetch("/api/notifications/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: input.user_id,
      title: input.title,
      body: input.body ?? "",
      data: { type: input.type ?? "system", path: input.link ?? "/dashboard/notifications" },
    }),
  });
}
