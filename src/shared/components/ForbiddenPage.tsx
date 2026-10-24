import { useNavigate } from 'react-router';
import { ShieldOff, ArrowLeft } from 'lucide-react';
import Button from './ui/Button';

export default function ForbiddenPage() {
  const navigate = useNavigate();

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
        <Button icono={ArrowLeft} className="mt-7" onClick={() => navigate('/dashboard')}>
          Ir al inicio
        </Button>
      </div>
    </div>
  );
}
