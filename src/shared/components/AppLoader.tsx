export default function AppLoader() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background"
      role="status"
      aria-live="polite"
      aria-label="Cargando aplicación..."
    >
      <div className="flex flex-col items-center gap-5">
        {/* Brand mark with pulse ring */}
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-2xl bg-primary/20" aria-hidden />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <span className="text-2xl font-bold text-primary-foreground">A</span>
          </div>
        </div>

        {/* Spinner */}
        <div
          className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary"
          aria-hidden
        />

        <p className="text-sm font-medium text-on-surface-secondary">Iniciando ArquiSoft…</p>
      </div>
    </div>
  );
}

