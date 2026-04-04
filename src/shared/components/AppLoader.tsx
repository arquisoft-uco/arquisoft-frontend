export default function AppLoader() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background"
      role="status"
      aria-live="polite"
      aria-label="Cargando aplicación..."
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg">
          <span className="text-xl font-bold text-primary-foreground">A</span>
        </div>
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary"
          aria-hidden
        />
        <p className="text-sm text-on-surface-secondary">ArquiSoft</p>
      </div>
    </div>
  );
}
