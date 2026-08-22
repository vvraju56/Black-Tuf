"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { AvatarWithFallback } from "@/components/ui/avatar";
import { useMyEngineerProfile, useUpsertEngineerProfile } from "@/hooks/use-engineers";
import { useProjects } from "@/hooks/use-projects";
import { useAuth } from "@/hooks/use-auth";
import { useRealtime } from "@/hooks/use-realtime";
import { useDashboardTitle } from "@/components/dashboard/dashboard-context";
import { toast } from "sonner";
import { Star, Briefcase, ExternalLink, Award, Link2, Plus, X, Save, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

export default function EngineerPortfolioPage() {
  useDashboardTitle("Portfolio", "Your public engineer profile");
  const { user } = useAuth();
  const { data: profile, isLoading } = useMyEngineerProfile();
  const { data: projects } = useProjects();

  useRealtime("engineer-portfolio", [
    { table: "engineer_profiles", queryKeys: [["engineers"]] },
  ]);

  const completed = useMemo(
    () => (projects ?? []).filter((p) => p.engineer_id === user?.id && p.status === "completed"),
    [projects, user]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card flex flex-wrap items-center gap-4 rounded-2xl p-6">
        <AvatarWithFallback
          src={user?.user_metadata?.avatar_url ?? profile?.profile?.avatar_url}
          name={user?.user_metadata?.full_name ?? profile?.profile?.full_name}
          email={user?.email}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xl font-bold">{profile?.profile?.full_name ?? user?.email}</p>
          <p className="text-sm text-muted-foreground">{profile?.title ?? "Engineer"}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {profile?.rating != null && (
              <Badge variant="secondary">
                <Star className="mr-1 h-3 w-3 fill-warning text-warning" /> {profile.rating}
              </Badge>
            )}
            {profile?.experience_years != null && (
              <Badge variant="secondary">
                <Briefcase className="mr-1 h-3 w-3" /> {profile.experience_years} yrs
              </Badge>
            )}
            {profile?.is_available && (
              <Badge variant="success">
                <CheckCircle2 className="mr-1 h-3 w-3" /> Available
              </Badge>
            )}
          </div>
        </div>
        <Button variant="gradient" size="sm" asChild>
          <Link href={`/engineers/${user?.id}`}>View Public Profile</Link>
        </Button>
      </div>

      {profile && (
        <PortfolioEditor profile={profile} />
      )}

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <Award className="h-5 w-5 text-primary" /> Completed Projects
        </h3>
        {completed.length === 0 ? (
          <EmptyState icon={Briefcase} title="No Completed Projects" description="Completed projects will appear here as you finish work." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {completed.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-2xl p-4"
              >
                <p className="font-semibold">{p.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{p.description?.slice(0, 80)}</p>
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant="success">Completed</Badge>
                  {p.budget != null && <span className="text-sm text-success">{formatCurrency(p.budget)}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PortfolioEditor({ profile }: { profile: NonNullable<ReturnType<typeof useMyEngineerProfile>["data"]> }) {
  const [links, setLinks] = useState<string[]>(profile.portfolio_links ?? []);
  const [certs, setCerts] = useState<string[]>(profile.certificates ?? []);
  const [linkInput, setLinkInput] = useState("");
  const [certInput, setCertInput] = useState("");
  const upsert = useUpsertEngineerProfile();

  const addLink = () => {
    const value = linkInput.trim();
    if (!value) return;
    setLinks((prev) => [...prev, value]);
    setLinkInput("");
  };

  const addCert = () => {
    const value = certInput.trim();
    if (!value) return;
    setCerts((prev) => [...prev, value]);
    setCertInput("");
  };

  const save = () => {
    upsert.mutate(
      { portfolio_links: links, certificates: certs },
      { onSuccess: () => toast.success("Portfolio updated.") }
    );
  };

  return (
    <div className="glass-card space-y-5 rounded-2xl p-6">
      <div>
        <h3 className="mb-3 flex items-center gap-2 font-semibold">
          <Link2 className="h-4 w-4 text-primary" /> Portfolio Links
        </h3>
        <div className="space-y-2">
          {links.map((link) => (
            <div key={link} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
              <a href={link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                <ExternalLink className="h-3.5 w-3.5" /> {link}
              </a>
              <button onClick={() => setLinks((prev) => prev.filter((l) => l !== link))} className="text-muted-foreground hover:text-destructive">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://…"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addLink()}
            />
            <Button size="sm" variant="secondary" onClick={addLink}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-2 font-semibold">
          <Award className="h-4 w-4 text-primary" /> Certificates
        </h3>
        <div className="flex flex-wrap gap-2">
          {certs.map((cert) => (
            <Badge key={cert} variant="secondary" className="gap-1 py-1 pr-1">
              {cert}
              <button onClick={() => setCerts((prev) => prev.filter((c) => c !== cert))} className="text-muted-foreground hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <Input
            placeholder="Certificate name…"
            value={certInput}
            onChange={(e) => setCertInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCert()}
          />
          <Button size="sm" variant="secondary" onClick={addCert}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>

      <Button variant="gradient" size="sm" onClick={save} disabled={upsert.isPending}>
        <Save className="mr-1 h-4 w-4" /> Save Portfolio
      </Button>
    </div>
  );
}
