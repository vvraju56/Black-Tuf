export default function Loading() {
  return (
    <div className="container-page py-16 sm:py-20" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading page content</span>
      <div className="animate-pulse space-y-4">
        <div className="h-3 w-24 rounded-full bg-white/[0.08]" />
        <div className="h-10 w-full max-w-xl rounded-xl bg-white/[0.06]" />
        <div className="h-10 w-3/4 max-w-md rounded-xl bg-white/[0.06]" />
        <div className="h-4 w-full max-w-2xl rounded-full bg-white/[0.04]" />
        <div className="h-4 w-5/6 max-w-xl rounded-full bg-white/[0.04]" />
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
          >
            <div className="h-12 w-12 rounded-xl bg-white/[0.07]" />
            <div className="mt-5 h-4 w-2/3 rounded-full bg-white/[0.06]" />
            <div className="mt-3 h-3 w-full rounded-full bg-white/[0.04]" />
            <div className="mt-2 h-3 w-4/5 rounded-full bg-white/[0.04]" />
            <div className="mt-6 h-8 w-28 rounded-lg bg-white/[0.05]" />
          </div>
        ))}
      </div>
    </div>
  );
}
