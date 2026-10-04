import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useEstadosFicha } from '../hooks/useEstadosFicha';
import { useAgregarEstadoFichaPerfil } from '../hooks/useAgregarEstadoFichaPerfil';
import { toast } from '../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import Skeleton from '../../../shared/components/ui/Skeleton';

interface Props {
  fichaPerfilId: string;
  estadoActual?: string;
  onEstadoCambiado?: (nuevoNombre: string) => void;
}

export default function EstadosFichaPanel({
  fichaPerfilId,
  estadoActual,
  onEstadoCambiado,
}: Props) {
  const { data: estados = [], isLoading: isLoadingEstados } = useEstadosFicha();
  const { mutate, isPending } = useAgregarEstadoFichaPerfil(fichaPerfilId);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
  const [estadoActualNombre, setEstadoActualNombre] = useState(estadoActual);

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
      onError: (err) =>
        toast.error(
          'Error al cambiar estado',
          getApiErrorMessage(err, 'No se pudo actualizar el estado de la ficha.'),
        ),
    });
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {estadoActualNombre && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-on-surface-secondary">Estado actual:</span>
          <Badge variante="neutro">{estadoActualNombre}</Badge>
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
        <h3 className="text-sm font-semibold text-on-surface">Cambiar estado</h3>

        {isLoadingEstados ? (
          <Skeleton variante="formulario" etiqueta="Cargando estados..." />
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <label
                htmlFor="select-estado"
                className="block text-xs font-medium text-on-surface-secondary"
              >
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
                {estados.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            </div>

            <Button
              icono={RefreshCw}
              onClick={handleCambiarEstado}
              disabled={!estadoSeleccionado}
              cargando={isPending}
            >
              {isPending ? 'Cambiando…' : 'Cambiar estado'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
