import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useEstadosFicha } from '../hooks/useEstadosFicha';
import { useAgregarEstadoFichaPerfil } from '../hooks/useAgregarEstadoFichaPerfil';
import { toast } from '../../../shared/hooks/useToast';

const ESTADOS_PERMITIDOS = ['En Construcción', 'Disponible Para Evaluación'];

interface Props {
  fichaPerfilId: string;
  estadoActual?: string;
  onEstadoCambiado?: (nuevoNombre: string) => void;
}

export default function EstadosFichaPanel({ fichaPerfilId, estadoActual, onEstadoCambiado }: Props) {
  const { data: estados = [], isLoading: isLoadingEstados } = useEstadosFicha();
  const { mutate, isPending } = useAgregarEstadoFichaPerfil(fichaPerfilId);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
  const [estadoActualNombre, setEstadoActualNombre] = useState(estadoActual);

  const estadosDisponibles = estados.filter((e) => ESTADOS_PERMITIDOS.includes(e.nombre));

  const handleCambiarEstado = () => {
    if (!estadoSeleccionado) return;
    mutate(estadoSeleccionado, {
      onSuccess: (data) => {
        const nuevoNombre = estados.find((e) => e.id === data.estadoFichaId)?.nombre;
        if (nuevoNombre) {
          setEstadoActualNombre(nuevoNombre);
          onEstadoCambiado?.(nuevoNombre);
        }
        setEstadoSeleccionado('');
        toast.success('Estado actualizado', 'El estado de la ficha se registró correctamente.');
      },
      onError: () => toast.error('Error al cambiar estado', 'No se pudo actualizar el estado de la ficha.'),
    });
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {estadoActualNombre && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-on-surface-secondary">Estado actual:</span>
          <span className="inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium text-on-surface">
            {estadoActualNombre}
          </span>
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
        <h3 className="text-sm font-semibold text-on-surface">Cambiar estado</h3>

        {isLoadingEstados ? (
          <div className="flex items-center gap-2 text-sm text-on-surface-secondary" aria-live="polite" aria-busy="true">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" role="status">
              <span className="sr-only">Cargando estados...</span>
            </div>
            Cargando estados...
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <label htmlFor="select-estado" className="block text-xs font-medium text-on-surface-secondary">
                Nuevo estado
              </label>
              <select
                id="select-estado"
                value={estadoSeleccionado}
                onChange={(e) => setEstadoSeleccionado(e.target.value)}
                disabled={isPending}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              >
                <option value="">Seleccionar estado...</option>
                {estadosDisponibles.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleCambiarEstado}
              disabled={!estadoSeleccionado || isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" role="status">
                  <span className="sr-only">Guardando...</span>
                </div>
              ) : (
                <RefreshCw size={14} aria-hidden />
              )}
              Cambiar estado
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
