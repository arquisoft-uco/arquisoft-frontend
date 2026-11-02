import { useObservacionesRevisionEstudiante } from '../../hooks/useObservacionesRevisionEstudiante';
import { puedeAvanzarObservacion } from '../../utils/avance-observacion';
import ObservacionesRevisionPanelBase from '../ObservacionesRevisionPanelBase';
import CasillaAvanceObservacion from './CasillaAvanceObservacion';

const DESCRIPCION_EDITABLE =
  'Marca cada observación como solucionada y deshazlo si hace falta, mientras la revisión siga en progreso.';
const DESCRIPCION_SOLO_LECTURA =
  'Lo que tu asesor registró en esta revisión. Solo puedes consultarlas.';

interface Props {
  revisionAsesorId: string;
  editable: boolean;
  onCerrar: () => void;
}

export default function ObservacionesRevisionEstudiantePanel({
  revisionAsesorId,
  editable,
  onCerrar,
}: Props) {
  const { data, isLoading, isError, error, refetch } =
    useObservacionesRevisionEstudiante(revisionAsesorId);

  return (
    <ObservacionesRevisionPanelBase
      descripcion={editable ? DESCRIPCION_EDITABLE : DESCRIPCION_SOLO_LECTURA}
      descripcionVacia="Tu asesor aún no ha registrado observaciones en esta revisión."
      observaciones={data}
      isLoading={isLoading}
      isError={isError}
      error={error}
      acciones={
        editable
          ? (o) =>
              puedeAvanzarObservacion(o.estadoId) ? (
                <CasillaAvanceObservacion observacion={o} revisionAsesorId={revisionAsesorId} />
              ) : null
          : undefined
      }
      onReintentar={() => void refetch()}
      onCerrar={onCerrar}
    />
  );
}
