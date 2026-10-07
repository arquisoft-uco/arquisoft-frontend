import Skeleton from './ui/Skeleton';

export default function PageSkeleton() {
  return (
    <div className="flex animate-fade-up flex-col gap-6" aria-busy="true">
      <div className="flex flex-col gap-2" aria-hidden>
        <div className="skeleton h-8 w-52" />
        <div className="skeleton h-4 w-80 max-w-full" />
      </div>
      <div className="rounded-xl border border-border bg-surface p-6 shadow-card">
        <Skeleton variante="lineas" etiqueta="Cargando la página…" />
      </div>
    </div>
  );
}
