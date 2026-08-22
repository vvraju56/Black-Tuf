import { supabase } from "./client";
import type { ProjectFile } from "@/types";

export async function getProjectFiles(projectId: string): Promise<ProjectFile[]> {
  const { data, error } = await supabase()
    .from("project_files")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as ProjectFile[];
}

export async function addProjectFile(input: {
  project_id: string;
  uploaded_by: string;
  name: string;
  file_type: string;
  size: number;
  storage_path?: string | null;
}) {
  const { error } = await supabase().from("project_files").insert({
    project_id: input.project_id,
    uploaded_by: input.uploaded_by,
    name: input.name,
    file_type: input.file_type,
    size: input.size,
    storage_path: input.storage_path ?? null,
  });

  if (error) throw new Error(error.message);
}

export async function deleteProjectFile(id: string, storagePath?: string | null) {
  if (storagePath) {
    await supabase().storage.from("project-files").remove([storagePath]);
  }
  const { error } = await supabase().from("project_files").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getAllFiles(): Promise<ProjectFile[]> {
  const { data, error } = await supabase()
    .from("project_files")
    .select("*, project:project_id(id, name, service, client_id)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ProjectFile[];
}

export function fileKind(mimeOrName: string) {
  const lower = mimeOrName.toLowerCase();
  if (lower.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg|bmp|heic)$/.test(lower)) return "image";
  if (/\.(pdf)$/.test(lower)) return "pdf";
  if (/\.(zip|rar|7z|tar|gz)$/.test(lower)) return "archive";
  if (lower.startsWith("audio/") || /\.(mp3|wav|ogg|m4a|webm)$/.test(lower)) return "audio";
  if (/\.(mp4|mov|avi|mkv|webm)$/.test(lower)) return "video";
  return "file";
}
