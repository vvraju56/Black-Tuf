import { supabase } from "./client";

const BUCKETS = {
  avatars: "avatars",
  projectFiles: "project-files",
  quotations: "quotations",
  invoices: "invoices",
  profileAssets: "profile-assets",
} as const;

export async function uploadFile(
  bucket: keyof typeof BUCKETS,
  folder: string,
  file: File
): Promise<string> {
  const path = `${folder}/${crypto.randomUUID()}-${file.name.replace(/\s+/g, "_")}`;
  const { error } = await supabase().storage.from(BUCKETS[bucket]).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return path;
}

export function getPublicUrl(bucket: keyof typeof BUCKETS, path: string) {
  return supabase().storage.from(BUCKETS[bucket]).getPublicUrl(path).data.publicUrl;
}

export async function getSignedUrl(
  bucket: keyof typeof BUCKETS,
  path: string,
  expiresIn = 3600
) {
  const { data, error } = await supabase()
    .storage.from(BUCKETS[bucket])
    .createSignedUrl(path, expiresIn);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function downloadUrl(
  bucket: keyof typeof BUCKETS,
  path: string,
  expiresIn = 3600
) {
  return getSignedUrl(bucket, path, expiresIn);
}

export async function removeFile(bucket: keyof typeof BUCKETS, path: string) {
  const { error } = await supabase().storage.from(BUCKETS[bucket]).remove([path]);
  if (error) throw new Error(error.message);
}

export async function listBucketFiles(bucket: keyof typeof BUCKETS, folder?: string) {
  const { data, error } = await supabase()
    .storage.from(BUCKETS[bucket])
    .list(folder ?? "", { sortBy: { column: "created_at", order: "desc" } });
  if (error) throw new Error(error.message);
  return data ?? [];
}
