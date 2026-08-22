"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  CalendarClock,
  Clock,
  FileText,
  FolderOpen,
  Globe,
  Link2,
  MapPin,
  MessageSquare,
  Package,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AvatarWithFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/empty-state";
import { ProjectDetailSkeleton } from "@/components/projects/project-detail-skeleton";
import { useProject } from "@/hooks/use-projects";
import { useAuth } from "@/hooks/use-auth";
import { useProposalsForProject, useProposalCount } from "@/hooks/use-proposals";
import { useProjectFiles } from "@/hooks/use-files";
import { ProposalsList } from "@/components/projects/proposals-list";
import { SubmitProposal } from "@/components/projects/submit-proposal";
import { formatCurrency, formatDate, timeAgo } from "@/lib/utils";
import { SERVICE_BY_ID, PROJECT_STATUS } from "@/utils/constants";

export function ProjectDetailView({ id }: { id: string }) {
  const { data: project, isLoading } = useProject(id);
  const { user, profile } = useAuth();
  const { data: proposals } = useProposalsForProject(id);
  const { data: proposalCount } = useProposalCount(id);
  const { data: files } = useProjectFiles(id);

  const service = SERVICE_BY_ID[project?.service as keyof typeof SERVICE_BY_ID];
  const statusMeta = project ? PROJECT_STATUS[project.status] : null;
  const isClientOwner = project && user && project.client_id === user.id;
  const isEngineer = profile?.role === "engineer";

  const myProposal = useMemo(
    () => (user ? proposals?.find((p) => p.engineer_id === user.id) : null),
    [proposals, user]
  );

  if (isLoading) return <ProjectDetailSkeleton />;

  if (!project) {    return (
      <EmptyState
        icon={FolderOpen}
        title="Project not found"
        description="This project may have been removed or is not visible to you."
        action={
          <Button variant="secondary" asChild>
            <Link href="/projects">Back to projects</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="glass-card rounded-2xl p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant={statusMeta?.color as never}>{statusMeta?.label ?? project.status}</Badge>
            {project.service && (
              <Badge variant="outline" className="gap-1">
                {service ? <service.icon className="h-3 w-3" /> : null}
                {service?.title ?? project.service}
              </Badge>
            )}
            <Badge variant="secondary">{project.project_type === "online" ? "Online" : "On-Site"}</Badge>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{project.name}</h1>

          <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
            {project.budget != null && (
              <span className="inline-flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-success" />
                <span className="font-semibold text-foreground">{formatCurrency(project.budget)}</span>
              </span>
            )}
            {project.deadline && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="h-4 w-4" />
                Due {formatDate(project.deadline, { dateStyle: "medium" })}
              </span>
            )}
            {project.created_at && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Posted {timeAgo(project.created_at)}
              </span>
            )}
            {project.project_type === "on_site" && project.address && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {[project.address, project.city, project.state].filter(Boolean).join(", ")}
              </span>
            )}
            {proposalCount != null && (
              <span className="inline-flex items-center gap-1.5">
                <Package className="h-4 w-4" />
                {proposalCount} proposal{proposalCount === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {project.status === "in_progress" && (
            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span className="font-semibold text-foreground">{project.progress}%</span>
              </div>
              <Progress value={project.progress} />
            </div>
          )}

          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Description
            </h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {project.description || "No description provided."}
            </p>
          </div>

          {project.has_sample && (project.figma_link || project.adobe_link) && (
            <div className="mt-5">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Reference Designs
              </h2>
              <div className="flex flex-wrap gap-3">
                {project.figma_link && (
                  <a
                    href={project.figma_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm hover:bg-accent/60"
                  >
                    <Link2 className="h-4 w-4 text-primary" /> Open Figma link
                  </a>
                )}
                {project.adobe_link && (
                  <a
                    href={project.adobe_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm hover:bg-accent/60"
                  >
                    <Link2 className="h-4 w-4 text-primary" /> Open Adobe XD link
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {files && files.length > 0 && (
          <div className="glass-card rounded-2xl p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <FileText className="h-4 w-4" /> Attachments
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {files.map((f) => (
                <div key={f.id} className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3 text-sm">
                  <FileText className="h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(f.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isClientOwner || profile?.role === "admin" ? (
          <div className="glass-card rounded-2xl p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Proposals ({proposalCount ?? 0})
            </h2>
            <ProposalsList projectId={id} />
          </div>
        ) : isEngineer ? (
          <div className="glass-card rounded-2xl p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {myProposal ? "Your Proposal" : "Submit a Proposal"}
            </h2>
            <SubmitProposal projectId={id} />
          </div>
        ) : null}
      </div>

      <div className="space-y-6">
        <div className="glass-card rounded-2xl p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Project Summary
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Budget</dt>
              <dd className="font-semibold">{project.budget != null ? formatCurrency(project.budget) : "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Deadline</dt>
              <dd>{project.deadline ? formatDate(project.deadline, { dateStyle: "medium" }) : "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Priority</dt>
              <dd className="capitalize">{project.priority}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Type</dt>
              <dd className="flex items-center gap-1">
                {project.project_type === "online" ? <Globe className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                {project.project_type === "online" ? "Online" : "On-Site"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Proposals</dt>
              <dd>{proposalCount ?? 0}</dd>
            </div>
          </dl>

          {project.engineer && (
            <div className="mt-5 border-t border-border/60 pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Assigned Engineer
              </p>
              <div className="flex items-center gap-3">
                <AvatarWithFallback
                  src={project.engineer.avatar_url}
                  name={project.engineer.full_name}
                  email={project.engineer.email}
                  size="sm"
                />
                <div>
                  <p className="text-sm font-medium">{project.engineer.full_name ?? "Engineer"}</p>
                  <p className="text-xs text-muted-foreground">{project.engineer.email}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2">
            {isEngineer && !myProposal && project.status === "pending" && (
              <a href="#submit-proposal">
                <Button className="w-full" variant="gradient">
                  <MessageSquare className="h-4 w-4" />
                  Submit Proposal
                </Button>
              </a>
            )}
            {isClientOwner && (
              <Button className="w-full" variant="secondary" asChild>
                <Link href={`/dashboard/projects/${project.id}`}>Manage Project</Link>
              </Button>
            )}
            <Button variant="ghost" asChild>
              <Link href="/projects">Back to projects</Link>
            </Button>
          </div>
        </div>

        {project.client && (
          <div className="glass-card rounded-2xl p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Posted by
            </h2>
            <div className="flex items-center gap-3">
              <AvatarWithFallback
                src={project.client.avatar_url}
                name={project.client.full_name}
                email={project.client.email}
                size="lg"
              />
              <div>
                <p className="font-semibold">{project.client.full_name ?? "Client"}</p>
                <p className="text-xs text-muted-foreground">Client on Black Tuf</p>
              </div>
            </div>
          </div>
        )}

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 text-success">
            <ShieldCheck className="h-5 w-5" />
            <h3 className="font-semibold">Black Tuf Protected</h3>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Milestone-based payments, verified engineer profiles and realtime
            progress tracking on every engagement.
          </p>
        </div>
      </div>
    </div>
  );
}
