import "server-only";
import { randomBytes } from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { verifyFirebaseIdToken } from "@/lib/firebase/admin";

function origin() {
  const vercel = process.env.VERCEL_URL;
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

/**
 * Look up an existing Supabase auth user by email. Returns null when the
 * auth schema isn't exposed or no match is found.
 */
async function findAuthUser(
  admin: ReturnType<typeof createServiceRoleClient>,
  email: string,
): Promise<{ id: string } | null> {
  try {
    const { data, error } = await admin
      .schema("auth")
      .from("users")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();
    if (error || !data) return null;
    return { id: data.id };
  } catch {
    return null;
  }
}

/**
 * Last-resort user lookup that pages through the auth user list via the
 * Admin API. Works even when the auth schema isn't exposed for direct
 * table queries.
 */
async function findAuthUserByListing(
  admin: ReturnType<typeof createServiceRoleClient>,
  email: string,
): Promise<{ id: string } | null> {
  try {
    let page = 1;
    // Page through users (1000 per page) until we find a match or run out.
    // Cap at 10 pages (10k users) to avoid unbounded loops.
    while (page <= 10) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error || !data?.users?.length) break;
      const match = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (match) return { id: match.id };
      if (data.users.length < 1000) break;
      page++;
    }
    return null;
  } catch {
    return null;
  }
}

export interface ExchangeResult {
  redirectUrl: string;
  tokenHash: string | null;
  email: string;
  emailVerified: boolean;
  isNewUser: boolean;
}

/**
 * Verifies a Firebase ID token and bridges the user into Supabase:
 *  1. Finds the matching Supabase auth user by email (or creates one).
 *  2. Syncs their profile (firebase_uid, name, avatar, phone, role).
 *  3. Generates a magic-link so the browser can establish a real Supabase
 *     session — keeping RLS and all existing services working unchanged.
 *
 * `role` is applied only when creating a brand-new profile (defaults to
 * "client"); existing profiles keep their stored role.
 */
export async function exchangeFirebaseToken(
  idToken: string,
  next?: string | null,
  role?: string | null
): Promise<ExchangeResult> {
  const firebaseUser = await verifyFirebaseIdToken(idToken);
  if (!firebaseUser.email) {
    throw new Error("Firebase account has no email address.");
  }

  const admin = createServiceRoleClient();

  // Probe the deployed schema: the updated schema.sql adds firebase_uid, but
  // older deployments may not have it yet. Everything below degrades to the
  // columns that actually exist so an existing email is always matched and
  // never re-created (createUser would throw user_already_exists).
  let hasFirebaseUid = false;
  try {
    const probe = await admin.from("profiles").select("firebase_uid").limit(1);
    hasFirebaseUid = !probe.error;
  } catch {
    hasFirebaseUid = false;
  }

  // 1. Find an existing Supabase auth user by email.
  type ExistingUser = {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    role: string | null;
  };
  let existingUser: ExistingUser | null = null;

  // 1a. profiles by email (works on old and new schemas).
  const profileQuery = await admin
    .from("profiles")
    .select("id, email, full_name, avatar_url, phone, role")
    .eq("email", firebaseUser.email)
    .maybeSingle();
  if (profileQuery.data && !profileQuery.error) {
    existingUser = profileQuery.data;
  }

  // 1b. auth.users fallback (requires the auth schema to be exposed in the
  //     Supabase dashboard: Settings > API > Exposed schemas).
  if (!existingUser) {
    try {
      const authUser = await admin
        .schema("auth")
        .from("users")
        .select("id, email, raw_user_meta_data")
        .eq("email", firebaseUser.email)
        .maybeSingle();
      if (authUser.data && !authUser.error) {
        const meta = (authUser.data.raw_user_meta_data ?? {}) as {
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          role?: string | null;
        };
        existingUser = {
          id: authUser.data.id,
          full_name: meta.full_name ?? null,
          avatar_url: meta.avatar_url ?? null,
          phone: meta.phone ?? null,
          role: meta.role ?? null,
        };
      }
    } catch {
      // The auth schema isn't exposed — the profiles lookup above is enough.
    }
  }

  const requestedRole = role === "engineer" || role === "admin" || role === "client" ? role : "client";

  let userId: string;
  let isNewUser = false;

  if (existingUser) {
    userId = existingUser.id;
  } else {
    isNewUser = true;
    const password = randomBytes(24).toString("base64url");
    const { data, error } = await admin.auth.admin.createUser({
      email: firebaseUser.email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: firebaseUser.name ?? "",
        phone: firebaseUser.phone,
        avatar_url: firebaseUser.picture,
        firebase_uid: firebaseUser.uid,
        role: requestedRole,
      },
    });
    if (error) {
      // createUser failed. The most common cause is that the email already
      // exists in auth.users but wasn't found in profiles. Attempt to find the
      // user and reuse them instead of failing outright.
      const found = await findAuthUser(admin, firebaseUser.email);
      if (found) {
        userId = found.id;
        isNewUser = false;
      } else {
        // Last resort: list users via the Admin API.
        const foundViaList = await findAuthUserByListing(admin, firebaseUser.email);
        if (foundViaList) {
          userId = foundViaList.id;
          isNewUser = false;
        } else {
          const errAny = error as { message?: string; error_description?: string; status?: number; code?: string; name?: string };
          throw new Error(
            `createUser: ${errAny.error_description || errAny.message || errAny.name || JSON.stringify(error)} (email: ${firebaseUser.email})`,
          );
        }
      }
    } else {
      userId = data.user?.id;
      if (!userId) throw new Error("Failed to create Supabase user.");
    }
  }

  // 2. Sync the profile (name, avatar, phone, firebase_uid, role default client,
  //    email_verified from the verified Firebase token).
  const profileUpdate: Record<string, string | null | boolean> = {
    full_name: firebaseUser.name ?? existingUser?.full_name ?? "",
    avatar_url: firebaseUser.picture ?? existingUser?.avatar_url ?? null,
    phone: firebaseUser.phone ?? existingUser?.phone ?? null,
    role: existingUser?.role ?? requestedRole,
    email_verified: firebaseUser.emailVerified,
  };
  if (hasFirebaseUid) profileUpdate.firebase_uid = firebaseUser.uid;

  const { error: updateError } = await admin
    .from("profiles")
    .update(profileUpdate)
    .eq("id", userId);
  if (updateError) throw new Error(`updateProfile: ${updateError.message}`);

  // 3. Generate a magic link to establish the browser Supabase session.
  const redirectTo = `${origin()}/auth/callback`;
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: firebaseUser.email,
    options: { redirectTo },
  });
  if (linkError) throw new Error(`generateLink: ${linkError.message}`);

  const hashedToken = linkData?.properties?.hashed_token;
  if (!hashedToken) throw new Error("Failed to generate session link.");

  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/";
  const redirectUrl = `${redirectTo}?token_hash=${encodeURIComponent(hashedToken)}&type=magiclink&next=${encodeURIComponent(safeNext)}`;

  return { redirectUrl, tokenHash: hashedToken, email: firebaseUser.email, emailVerified: firebaseUser.emailVerified, isNewUser };
}
