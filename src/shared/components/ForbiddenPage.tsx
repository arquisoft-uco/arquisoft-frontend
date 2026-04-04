import { Link } from 'react-router';
import { ShieldOff } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-12 bg-background" role="main">
      <div
        className="w-full max-w-md rounded-xl border border-border bg-surface p-10 text-center shadow-sm"
        aria-labelledby="forbidden-title"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <ShieldOff size={32} className="text-red-500" aria-hidden />
        </div>
        <h1 id="forbidden-title" className="text-xl font-bold text-on-surface">
          Acceso Denegado
        </h1>
        <p className="mt-2 text-sm text-on-surface-secondary">
          No tienes los permisos necesarios para acceder a esta sección.
        </p>
        <Link
          to="/dashboard"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
