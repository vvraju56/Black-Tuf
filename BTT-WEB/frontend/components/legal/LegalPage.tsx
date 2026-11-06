import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';

export interface LegalSection {
  id: string;
  title: string;
  body: React.ReactNode;
}

export function LegalPage({
  eyebrow,
  title,
  description,
  updated,
  sections,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  updated: string;
  sections: LegalSection[];
  children?: React.ReactNode;
}) {
  return (
    <>
      <PageHero
        eyebrow={eyebrow}
        title={title}
        description={description}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: eyebrow }]}
      >
        <p className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[0.74rem] text-ink-muted">
          <FileText className="h-3.5 w-3.5 text-accent" aria-hidden />
          Last updated: {updated}
        </p>
      </PageHero>

      <div className="container-page py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14">
          <aside className="hidden lg:block">
            <nav
              aria-label="On this page"
              className="sticky top-28 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"
            >
              <p className="mb-2 px-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-ink-faint">
                On this page
              </p>
              <ul className="space-y-0.5">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="block rounded-lg px-2 py-1.5 text-[0.78rem] text-ink-muted transition-colors hover:bg-white/[0.04] hover:text-white"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <article className="min-w-0 max-w-3xl">
            <div className="space-y-10">
              {sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-28">
                  <h2 className="font-display text-xl font-semibold tracking-[-0.03em] text-white sm:text-2xl">
                    {section.title}
                  </h2>
                  <div className="article-body mt-3">{section.body}</div>
                </section>
              ))}
            </div>

            {children}

            <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-white/[0.07] pt-6">
              <Link href="/" className="btn btn-secondary">
                <ArrowLeft className="h-4 w-4" aria-hidden /> Back to home
              </Link>
              <Link href="/contact" className="btn btn-secondary">
                Contact BlackTuf
              </Link>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
