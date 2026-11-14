import { University } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useProveedorStore } from '../../auth/proveedorStore';
import { useProveedoresDisponibles } from '../../hooks/useAuth';
import Button from '../../shared/components/ui/Button';
import Notice from '../../shared/components/ui/Notice';

interface EstadoNavegacion {
  desde?: string;
}

export default function IniciarSesion() {
  const proveedores = useProveedoresDisponibles();
  const elegirProveedor = useProveedorStore((s) => s.elegirProveedor);
  const navigate = useNavigate();
  const { state } = useLocation();
  const desde = (state as EstadoNavegacion | null)?.desde;

  function elegir(id: string) {
    elegirProveedor(id);
    navigate(desde ?? '/dashboard', { replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-up rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
        <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-xl bg-primary">
          <University size={22} className="text-primary-foreground" aria-hidden />
        </div>
        <h1 className="text-center text-xl font-bold text-on-surface">Inicia sesión</h1>
        <p className="mt-1 text-center text-sm text-on-surface-secondary">
          Elige cómo quieres entrar a ArquiSoft.
        </p>
        <div className="mt-6 flex flex-col gap-4">
          {proveedores.length === 0 && (
            <Notice variante="advertencia">
              No hay ningún método de inicio de sesión disponible.
            </Notice>
          )}
          {proveedores.map(({ id, titulo, descripcion }, indice) => (
            <div key={id} className="flex flex-col gap-1.5">
              <Button
                variante={indice === 0 ? 'primario' : 'secundario'}
                className="w-full"
                onClick={() => elegir(id)}
              >
                Continuar con {titulo}
              </Button>
              <p className="text-center text-xs text-on-surface-secondary">{descripcion}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
