import { MessageSquare } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Notice from '../../../../shared/components/ui/Notice';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage, isApiErrorWithStatus } from '../../../../shared/utils/api-error';
import { useObservacionesItemJurado } from '../../hooks/useObservacionesItemJurado';
import type { EvaluacionCuantitativaJurado } from '../../models/EvaluacionCuantitativaJurado';
import type { ObservacionItemJurado } from '../../models/ObservacionItemJurado';

const LISTA = 'flex flex-col gap-3';
const TARJETA = 'flex flex-col items-start gap-3 rounded-xl border border-border bg-surface p-4';
const TEXTO = 'whitespace-pre-wrap break-words text-sm text-on-surface';

interface Props {
  valoracion: EvaluacionCuantitativaJurado;
  puedeModificar: boolean;
  onModificar: (observacion: ObservacionItemJurado) => void;
  onCerrar: () => void;
}

export default function ObservacionesItemJuradoPanel({
  valoracion,
  puedeModificar,
  onModificar,
  onCerrar,
}: Props) {
  const { data, isLoading, isError, error, refetch } = useObservacionesItemJurado(valoracion.id);
  const observaciones = data?.content ?? [];

  function cuerpo() {
    if (isLoading) return <Skeleton variante="lineas" etiqueta="Cargando observaciones…" />;
    if (isError) {
      if (isApiErrorWithStatus(error, 422)) {
        return (
          <ErrorState
            titulo="Este ítem ya no está disponible"
            descripcion="Puede que la valoración ya no exista. Cierra este panel e inténtalo con otro ítem."
          />
        );
      }
      return (
        <ErrorState
          titulo="No se pudieron cargar las observaciones"
          descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
          onReintentar={() => void refetch()}
        />
      );
    }
    if (observaciones.length === 0) {
      return (
        <EmptyState
          icono={MessageSquare}
          titulo="Este ítem no tiene observaciones"
          descripcion="Las observaciones que registres al evaluar aparecerán aquí."
        />
      );
    }
    return (
      <ul className={LISTA}>
        {observaciones.map((observacion) => (
          <li key={observacion.id} className={TARJETA}>
            <p className={TEXTO}>{observacion.descripcion}</p>
            {puedeModificar && (
              <Button
                variante="secundario"
                aria-label={
                  observaciones.length > 1
                    ? `Modificar observación: ${observacion.descripcion}`
                    : undefined
                }
                onClick={() => onModificar(observacion)}
              >
                Modificar observación
              </Button>
            )}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <SidePanel
      titulo="Observaciones del ítem"
      descripcion={valoracion.item.nombre}
      onCerrar={onCerrar}
    >
      <div className="flex flex-col gap-4">
        {!puedeModificar && (
          <Notice variante="info">
            La evaluación está finalizada; las observaciones ya no se pueden modificar.
          </Notice>
        )}
        {cuerpo()}
      </div>
    </SidePanel>
  );
}
