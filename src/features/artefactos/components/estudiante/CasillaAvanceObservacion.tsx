import { useCambiarEstadoObservacionEstudiante } from '../../hooks/useCambiarEstadoObservacionEstudiante';
import type { ObservacionRevision } from '../../models/ObservacionRevision';
import { estadoDestinoAvance } from '../../utils/avance-observacion';
import { ESTADO_OBSERVACION_SOLUCIONADA } from '../../utils/decision-observacion';

const ETIQUETA =
  'tap-target flex shrink-0 cursor-pointer items-center gap-2 text-sm text-on-surface';
const CASILLA = 'checkbox-control shrink-0 accent-primary';

interface Props {
  observacion: ObservacionRevision;
  revisionAsesorId: string;
}

export default function CasillaAvanceObservacion({ observacion, revisionAsesorId }: Props) {
  const mutacion = useCambiarEstadoObservacionEstudiante();
  const solucionada = observacion.estadoId === ESTADO_OBSERVACION_SOLUCIONADA;

  function cambiar() {
    if (mutacion.isPending) return;
    mutacion.mutate({
      observacionId: observacion.id,
      revisionAsesorId,
      estado: estadoDestinoAvance(observacion.estadoId),
    });
  }

  return (
    <label className={ETIQUETA}>
      <input
        type="checkbox"
        className={CASILLA}
        checked={solucionada}
        aria-disabled={mutacion.isPending}
        aria-busy={mutacion.isPending}
        aria-label={`Solucionada: ${observacion.descripcion}`}
        onChange={cambiar}
      />
      <span aria-hidden="true">Solucionada</span>
    </label>
  );
}
