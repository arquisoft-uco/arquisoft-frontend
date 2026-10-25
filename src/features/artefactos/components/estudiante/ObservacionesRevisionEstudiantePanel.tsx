import { useObservacionesRevisionEstudiante } from '../../hooks/useObservacionesRevisionEstudiante';
import ObservacionesRevisionPanelBase from '../ObservacionesRevisionPanelBase';

interface Props {
  revisionAsesorId: string;
  onCerrar: () => void;
}

export default function ObservacionesRevisionEstudiantePanel({
  revisionAsesorId,
  onCerrar,
}: Props) {
  const { data, isLoading, isError, error, refetch } =
    useObservacionesRevisionEstudiante(revisionAsesorId);

  return (
    <ObservacionesRevisionPanelBase
      descripcion="Lo que tu asesor registró en esta revisión."
      descripcionVacia="Tu asesor aún no ha registrado observaciones en esta revisión."
      observaciones={data}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onReintentar={() => void refetch()}
      onCerrar={onCerrar}
    />
  );
}
