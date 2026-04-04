import { Link } from 'react-router';
import { ShieldOff, ArrowLeft } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6" role="main">
      <div
        className="w-full max-w-sm animate-fade-up rounded-2xl border border-border bg-surface p-8 text-center shadow-card"
        aria-labelledby="forbidden-title"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-danger/10">
          <ShieldOff size={30} className="text-danger" aria-hidden />
        </div>
        <h1 id="forbidden-title" className="text-lg font-bold text-on-surface">
          Acceso Denegado
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-secondary">
          No tienes los permisos necesarios para acceder a esta sección.
        </p>
        <Link
          to="/dashboard"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary-hover hover:shadow-md active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ArrowLeft size={16} aria-hidden />
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}

