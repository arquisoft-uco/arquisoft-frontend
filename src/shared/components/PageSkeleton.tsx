export default function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-fade-up" aria-hidden aria-busy="true">
      {/* Page header skeleton */}
      <div className="flex flex-col gap-2">
        <div className="skeleton h-8 w-52" />
        <div className="skeleton h-4 w-80" />
      </div>

      {/* Stat row skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5 shadow-card">
            <div className="skeleton h-11 w-11 rounded-xl" />
            <div className="flex flex-col gap-2">
              <div className="skeleton h-6 w-10" />
              <div className="skeleton h-3 w-28" />
            </div>
          </div>
        ))}
      </div>

      {/* Content card skeleton */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-3">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-5/6" />
          <div className="skeleton h-4 w-4/6" />
          <div className="skeleton mt-2 h-4 w-full" />
          <div className="skeleton h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}

