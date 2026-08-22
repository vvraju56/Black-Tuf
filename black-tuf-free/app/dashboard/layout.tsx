import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BlackTufDashboardShell } from "@/components/dashboard/black-tuf-shell";
import { clientNav } from "@/components/dashboard/nav-config";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <BlackTufDashboardShell nav={clientNav}>
      {children}
    </BlackTufDashboardShell>
  );
}
