import { getPublicPortfolio } from "@/services/public";
import { PublicShell } from "@/features/site/shell";
import { PortfolioGrid } from "@/features/site/portfolio-grid";

export default async function PortfolioPage() {
  let projects: Awaited<ReturnType<typeof getPublicPortfolio>> = [];
  try {
    projects = await getPublicPortfolio();
  } catch {
    projects = [];
  }

  return (
    <PublicShell>
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight">Portfolio</h1>
          <p className="mt-4 text-muted-foreground">
            A selection of projects we've shipped across web, mobile, games,
            IoT, PLC and electrical engineering.
          </p>
        </div>
        <PortfolioGrid projects={projects} />
      </section>
    </PublicShell>
  );
}
