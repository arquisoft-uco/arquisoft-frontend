import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useEstadosFicha } from '../hooks/useEstadosFicha';
import { useAgregarEstadoFichaPerfil } from '../hooks/useAgregarEstadoFichaPerfil';
import { toast } from '../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import AvisoNoDisponible from '../../../shared/components/AvisoNoDisponible';
import Button from '../../../shared/components/ui/Button';
import Field from '../../../shared/components/ui/Field';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { InsigniaEstadoFicha } from './FichaCeldas';

// Pendiente B1: el endpoint de cambio de estado aún no existe en el backend.
const CAMBIO_DE_ESTADO_PENDIENTE = true;

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
  const estadoActualId = estados.find((e) => e.nombre === estadoActualNombre)?.id;

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
    <div className="flex flex-col gap-4 animate-fade-up">
      {estadoActualNombre && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-on-surface-secondary">Estado actual:</span>
          <InsigniaEstadoFicha estadoId={estadoActualId ?? ''} nombre={estadoActualNombre} />
        </div>
      )}

      <AvisoNoDisponible recurso="el cambio de estado" />

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
        <h3 className="text-sm font-semibold text-on-surface">Cambiar estado</h3>

        {isLoadingEstados ? (
          <Skeleton variante="formulario" etiqueta="Cargando estados…" />
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Field etiqueta="Nuevo estado">
                {(control) => (
                  <select
                    {...control}
                    value={estadoSeleccionado}
                    onChange={(e) => setEstadoSeleccionado(e.target.value)}
                    disabled={isPending}
                    className="field-input"
                  >
                    <option value="">Seleccionar estado...</option>
                    {estados.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nombre}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            </div>

            <Button
              icono={RefreshCw}
              onClick={handleCambiarEstado}
              disabled={CAMBIO_DE_ESTADO_PENDIENTE || !estadoSeleccionado}
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
