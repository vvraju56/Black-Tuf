import type { DocBlock, DocSection } from '@/lib/docs';

function EndpointRow({ method, path, description }: { method: string; path: string; description: string }) {
  const colors: Record<string, string> = {
    GET: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300',
    POST: 'border-sky-400/25 bg-sky-400/10 text-sky-300',
    PUT: 'border-amber-400/25 bg-amber-400/10 text-amber-300',
    PATCH: 'border-amber-400/25 bg-amber-400/10 text-amber-300',
    DELETE: 'border-red-400/25 bg-red-400/10 text-red-300',
  };
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3.5 sm:flex-row sm:items-start sm:gap-3">
      <span
        className={`inline-flex w-fit shrink-0 rounded-md border px-2 py-0.5 font-mono text-[0.64rem] font-bold ${
          colors[method] || 'border-white/15 bg-white/5 text-ink-muted'
        }`}
      >
        {method}
      </span>
      <div className="min-w-0">
        <code className="break-all font-mono text-[0.8rem] font-medium text-white">{path}</code>
        <p className="mt-1 text-[0.8rem] leading-relaxed text-ink-muted">{description}</p>
      </div>
    </div>
  );
}

function Block({ block }: { block: DocBlock }) {
  if (block.type === 'paragraph') {
    return <p className="text-[0.92rem] leading-relaxed text-ink-muted">{block.text}</p>;
  }

  if (block.type === 'list') {
    return (
      <ul className="space-y-2">
        {block.items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-[0.9rem] leading-relaxed text-ink-muted">
            <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_8px_rgba(255,121,238,0.7)]" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === 'steps') {
    return (
      <ol className="space-y-4 border-l border-white/[0.1] pl-6">
        {block.items.map((item, index) => (
          <li key={`${item.title}-${index}`} className="relative">
            <span className="absolute -left-[2rem] flex h-5 w-5 items-center justify-center rounded-full border border-accent/30 bg-[#0b0b10] text-[0.6rem] font-semibold text-accent">
              {index + 1}
            </span>
            <p className="text-[0.9rem] font-semibold text-white">{item.title}</p>
            <p className="mt-1 text-[0.86rem] leading-relaxed text-ink-muted">{item.description}</p>
          </li>
        ))}
      </ol>
    );
  }

  if (block.type === 'callout') {
    return (
      <div className="rounded-xl border border-accent/20 bg-accent/[0.06] p-4">
        <p className="text-[0.84rem] font-semibold text-accent-soft">{block.title}</p>
        <p className="mt-1.5 text-[0.84rem] leading-relaxed text-ink-muted">{block.text}</p>
      </div>
    );
  }

  if (block.type === 'endpoint') {
    return <EndpointRow method={block.method} path={block.path} description={block.description} />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.09] bg-[#070709]">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-2">
        <span className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
          {block.language}
        </span>
      </div>
      <pre className="overflow-x-auto p-4 text-[0.78rem] leading-relaxed text-ink-muted">
        <code>{block.code}</code>
      </pre>
    </div>
  );
}

export function DocSections({ sections }: { sections: DocSection[] }) {
  return (
    <div className="space-y-12">
      {sections.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-28">
          <h2 className="text-balance font-display text-[1.4rem] font-semibold tracking-[-0.03em] text-white">
            {section.title}
          </h2>
          <div className="mt-4 space-y-4">
            {section.blocks.map((block, index) => (
              <Block key={`${section.id}-${index}`} block={block} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
