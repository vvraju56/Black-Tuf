import { Suspense } from "react";
import { ServiceDetailView } from "@/components/services/service-detail-view";
import { PublicShell } from "@/features/site/shell";

export const dynamic = "force-dynamic";

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <PublicShell>
      <Suspense fallback={null}>
        <ServiceDetailView slug={slug} />
      </Suspense>
    </PublicShell>
  );
}
