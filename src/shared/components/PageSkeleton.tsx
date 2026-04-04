export default function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-fade-up" aria-hidden>
      <div className="h-8 w-48 rounded-lg bg-border" />
      <div className="h-4 w-72 rounded-lg bg-border" />
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-border" />
          <div className="h-4 w-5/6 rounded bg-border" />
          <div className="h-4 w-4/6 rounded bg-border" />
        </div>
      </div>
    </div>
  );
}
