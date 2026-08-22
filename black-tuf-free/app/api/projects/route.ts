import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const runtime = "nodejs";

/**
 * POST /api/projects
 * Creates a project using the service-role client (bypasses RLS) after
 * verifying the requesting user's session via the cookie-based server client.
 * Called from the Post Project wizard / admin form. The browser client session
 * isn't always established after the Firebase → magic-link exchange, so we
 * verify auth server-side and persist with the service role.
 */
export async function POST(request: Request) {
  const server = await createClient();
  const {
    data: { user },
  } = await server.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name : "";
  const description = typeof body.description === "string" ? body.description : "";
  const service = typeof body.service === "string" ? body.service : "";
  const domains = Array.isArray(body.domains) ? (body.domains as string[]) : [];
  const skills = Array.isArray(body.skills) ? (body.skills as string[]) : [];

  if (name.length < 4) return NextResponse.json({ error: "Give your project a clear title (min 4 characters)." }, { status: 400 });
  if (description.length < 20) return NextResponse.json({ error: "Describe your project in at least 20 characters." }, { status: 400 });
  if (!domains.length) return NextResponse.json({ error: "Select at least one service domain." }, { status: 400 });

  const projectType = body.project_type === "on_site" ? "on_site" : "online";
  const priority = body.priority === "high" || body.priority === "low" ? body.priority : "medium";
  const countryCode = typeof body.country_code === "string" ? body.country_code : "";
  const countryName = typeof body.country_name === "string" ? body.country_name : "";
  const currencyCode = typeof body.currency_code === "string" ? body.currency_code : "INR";
  const currencySymbol = typeof body.currency_symbol === "string" ? body.currency_symbol : "$";
  const budgetMin = Number(body.budget_min) || null;
  const budgetMax = Number(body.budget_max) || null;
  const deliveryDate = typeof body.delivery_date === "string" ? body.delivery_date : null;
  const timezone = typeof body.timezone === "string" ? body.timezone : null;
  const hasSample = body.has_sample === true;
  const figmaLink = hasSample && typeof body.figma_link === "string" ? body.figma_link : null;
  const adobeLink = hasSample && typeof body.adobe_link === "string" ? body.adobe_link : null;

  if (budgetMin == null || budgetMax == null) return NextResponse.json({ error: "Set a budget range." }, { status: 400 });
  if (budgetMax < budgetMin) return NextResponse.json({ error: "Maximum budget must be greater than or equal to minimum." }, { status: 400 });
  if (!deliveryDate) return NextResponse.json({ error: "Choose a delivery date." }, { status: 400 });

  // Enforce minimum delivery date of 1 day from today.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + 1);
  const selectedDate = new Date(deliveryDate + "T00:00:00");
  if (selectedDate < minDate) {
    return NextResponse.json({ error: "Delivery date must be at least one day from today." }, { status: 400 });
  }

  const admin = createServiceRoleClient();

  // Determine the client for this project. Admins may post on behalf of any
  // client; regular users always post for themselves.
  let clientId = user.id;
  const requestedClientId = typeof body.client_id === "string" ? body.client_id : "";
  if (requestedClientId && requestedClientId !== user.id) {
    const { data: caller } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (caller?.role !== "admin") {
      return NextResponse.json({ error: "You can only post projects for yourself." }, { status: 403 });
    }
    clientId = requestedClientId;
  }

  const { data, error } = await admin
    .from("projects")
    .insert({
      client_id: clientId,
      name,
      service,
      skills,
      project_type: projectType,
      address: projectType === "on_site" ? (typeof body.address === "string" ? body.address : null) : null,
      city: projectType === "on_site" ? (typeof body.city === "string" ? body.city : null) : null,
      state: projectType === "on_site" ? (typeof body.state === "string" ? body.state : null) : null,
      pincode: projectType === "on_site" ? (typeof body.pincode === "string" ? body.pincode : null) : null,
      country_code: countryCode,
      country_name: countryName,
      currency_code: currencyCode,
      currency_symbol: currencySymbol,
      budget_min: budgetMin,
      budget_max: budgetMax,
      delivery_date: deliveryDate,
      timezone,
      priority,
      description,
      has_sample: hasSample,
      is_published: true,
      figma_link: figmaLink,
      adobe_link: adobeLink,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Wire up domains in the join table.
  if (domains.length) {
    const { error: domError } = await admin
      .from("project_domains")
      .insert(domains.map((domain_id) => ({ project_id: data.id, domain_id })));
    if (domError) {
      // Non-fatal: project exists, domains can be retried.
      console.error("[api/projects] domain insert failed:", domError.message);
    }
  }

  return NextResponse.json({ id: data.id, redirectUrl: `/dashboard/projects/${data.id}` });
}
