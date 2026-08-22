import { PublicShell } from "@/features/site/shell";

export function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: { heading: string; body: string }[];
}) {
  return (
    <PublicShell>
      <section className="container mx-auto max-w-3xl px-6 py-16 md:py-20">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
        <div className="mt-8 space-y-8">
          {sections.map((s) => (
            <div key={s.heading}>
              <h2 className="text-lg font-semibold">{s.heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
