import { supabase } from "./client";
import { DEFAULT_MODULE_FLAGS, type ModuleFlags } from "@/utils/modules";

/**
 * Load feature flags. Stored under site_settings key "modules" (jsonb),
 * exposed to all roles via the public `get_module_flags()` RPC (see
 * supabase/modular.sql). Falls back to defaults when the RPC isn't
 * available yet so the app never breaks pre-migration.
 */
export async function getModuleFlags(): Promise<ModuleFlags> {
  try {
    const { data, error } = await supabase().rpc("get_module_flags");
    if (!error && data && typeof data === "object") {
      return { ...DEFAULT_MODULE_FLAGS, ...(data as Partial<ModuleFlags>) };
    }
  } catch {
    // fall through to defaults
  }
  return { ...DEFAULT_MODULE_FLAGS };
}

/** Admin-only: persist module toggles. */
export async function saveModuleFlags(flags: ModuleFlags) {
  const { error } = await supabase()
    .from("site_settings")
    .upsert({ key: "modules", value: flags as unknown as Record<string, unknown> });
  if (error) throw new Error(error.message);
}
