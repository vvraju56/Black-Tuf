import { Suspense } from "react";
import { ProjectDetailView } from "@/components/projects/project-detail-view";
import { ProjectDetailSkeleton } from "@/components/projects/project-detail-skeleton";
import { PublicShell } from "@/features/site/shell";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PublicShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Suspense fallback={<ProjectDetailSkeleton />}>
          <ProjectDetailView id={id} />
        </Suspense>
      </div>
    </PublicShell>
  );
}
