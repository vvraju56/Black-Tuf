import { Suspense } from "react";
import { EngineerProfileView } from "@/components/engineers/engineer-profile-view";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicShell } from "@/features/site/shell";

export const dynamic = "force-dynamic";

export default async function EngineerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PublicShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Suspense
          fallback={
            <div className="glass-card rounded-3xl p-8">
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            </div>
          }
        >
          <EngineerProfileView userId={id} />
        </Suspense>
      </div>
    </PublicShell>
  );
}
