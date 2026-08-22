"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { ActionResult } from "@/types";

export async function signOut(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function adminCreateClient(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const admin = await createClient();
  const {
    data: { user: adminUser },
  } = await admin.auth.getUser();

  // Only an authenticated admin may create client accounts.
  if (!adminUser) return { error: "Not authenticated." };

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", adminUser.id)
    .maybeSingle();
  if (!profile || profile.role !== "admin") return { error: "Admin only." };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) return { error: "Name, email and password are required." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const serviceRole = createServiceRoleClient();
  const { data, error } = await serviceRole.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name, phone: phone || null },
  });
  if (error) return { error: error.message };

  // The on_auth_user_created trigger creates the profile row. Ensure the
  // role is 'client' (it will be, unless this is the very first user).
  const userId = data.user?.id;
  if (userId) {
    await serviceRole.from("profiles")
      .update({ role: "client", full_name: name, phone: phone || null })
      .eq("id", userId);
  }

  revalidatePath("/admin", "layout");
  return { message: `Client "${name}" created.` };
}
