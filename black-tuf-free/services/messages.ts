import { supabase } from "./client";
import type { Message } from "@/types";

export async function getMessages(projectId: string): Promise<Message[]> {
  const { data, error } = await supabase()
    .from("messages")
    .select("*, sender:sender_id(id, full_name, email, role, avatar_url)")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Message[];
}

export async function sendMessage(
  projectId: string,
  senderId: string,
  payload: {
    content?: string | null;
    file_path?: string | null;
    file_name?: string | null;
    file_type?: string | null;
  }
): Promise<void> {
  const { error } = await supabase()
    .from("messages")
    .insert({
      project_id: projectId,
      sender_id: senderId,
      content: payload.content ?? null,
      file_path: payload.file_path ?? null,
      file_name: payload.file_name ?? null,
      file_type: payload.file_type ?? null,
    });

  if (error) throw new Error(error.message);
}

export async function getLatestMessages(limit = 100): Promise<Message[]> {
  const { data, error } = await supabase()
    .from("messages")
    .select("*, sender:sender_id(id, full_name, email, role, avatar_url), project:project_id(id, name, service)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Message[];
}

export async function markMessagesRead(projectId: string, userId: string) {
  const { error } = await supabase()
    .from("messages")
    .update({ read: true })
    .eq("project_id", projectId)
    .neq("sender_id", userId)
    .eq("read", false);

  if (error) throw new Error(error.message);
}

export async function unreadCount(userId: string): Promise<number> {
  const { data, error } = await supabase()
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("read", false)
    .neq("sender_id", userId);

  if (error) throw new Error(error.message);
  return data?.length ?? 0;
}

export async function unreadMessageCount(userId: string): Promise<number> {
  return unreadCount(userId);
}

// ---- typing indicators (realtime presence) ----

export async function setTyping(projectId: string, userId: string) {
  const { error } = await supabase()
    .from("typing_indicator")
    .upsert(
      { project_id: projectId, user_id: userId, updated_at: new Date().toISOString() },
      { onConflict: "project_id,user_id" }
    );

  if (error) throw new Error(error.message);
}

export async function clearTyping(projectId: string, userId: string) {
  const { error } = await supabase()
    .from("typing_indicator")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

export async function getTyping(projectId: string) {
  const { data, error } = await supabase()
    .from("typing_indicator")
    .select("user_id, updated_at, user:user_id(id, full_name, email)")
    .eq("project_id", projectId);

  if (error) throw new Error(error.message);
  return data ?? [];
}
