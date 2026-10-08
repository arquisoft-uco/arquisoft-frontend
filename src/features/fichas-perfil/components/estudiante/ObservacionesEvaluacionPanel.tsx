import { MessageSquare } from 'lucide-react';
import { useObservacionesEvaluacionMiFicha } from '../../hooks/useObservacionesEvaluacionMiFicha';
import type { EvaluacionFichaPerfilEstudiante } from '../../models/EvaluacionFichaPerfilEstudiante';
import Badge from '../../../../shared/components/ui/Badge';
import Button from '../../../../shared/components/ui/Button';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { varianteEstadoEvaluacion } from '../../../../shared/utils/estado-variante';

const OBSERVACION =
  'rounded-xl border border-border bg-surface-secondary p-4 text-sm break-words text-on-surface';

interface Props {
  evaluacion: EvaluacionFichaPerfilEstudiante;
  onCerrar: () => void;
}

export default function ObservacionesEvaluacionPanel({ evaluacion, onCerrar }: Props) {
  const { observaciones, isLoading, cargado, isError, error, refetch } =
    useObservacionesEvaluacionMiFicha(evaluacion.fichaPerfilId, evaluacion.id);

  return (
    <SidePanel
      titulo="Observaciones de la evaluación"
      descripcion={`Evaluada por ${evaluacion.representante.nombre}`}
      fin={
        <Badge
          variante={
            evaluacion.estadoEvaluacionId
              ? varianteEstadoEvaluacion(evaluacion.estadoEvaluacionId)
              : 'neutro'
          }
        >
          {evaluacion.estadoEvaluacionNombre ?? 'Sin estado'}
        </Badge>
      }
      onCerrar={onCerrar}
      pie={(solicitarCierre) => (
        <div className="sticky bottom-0 z-10 border-t border-border bg-surface p-4 sm:px-6">
          <div className="actions-row">
            <Button variante="secundario" onClick={solicitarCierre}>
              Cerrar
            </Button>
          </div>
        </div>
      )}
    >
      {isError ? (
        <ErrorState
          titulo="No pudimos cargar las observaciones"
          descripcion="Inténtalo nuevamente."
          detalle={getApiErrorMessage(error, 'No se pudieron cargar las observaciones.')}
          onReintentar={refetch}
        />
      ) : isLoading || !cargado ? (
        <Skeleton variante="lineas" etiqueta="Cargando observaciones…" />
      ) : observaciones.length === 0 ? (
        <EmptyState
          icono={MessageSquare}
          titulo="Esta evaluación aún no tiene observaciones"
          descripcion="Cuando el comité las registre, las verás aquí."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {observaciones.map((observacion) => (
            <li key={observacion.id} className={OBSERVACION}>
              {observacion.observacion}
            </li>
          ))}
        </ul>
      )}
    </SidePanel>
  );
}
