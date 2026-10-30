import { useObservacionesRevision } from '../../hooks/useObservacionesRevision';
import ObservacionesRevisionPanelBase from '../ObservacionesRevisionPanelBase';

interface Props {
  revisionAsesorId: string;
  onCerrar: () => void;
}

export default function ObservacionesRevisionPanel({ revisionAsesorId, onCerrar }: Props) {
  const { data, isLoading, isError, error, refetch } = useObservacionesRevision(revisionAsesorId);

  return (
    <ObservacionesRevisionPanelBase
      descripcion="Lo que registraste en esta revisión."
      descripcionVacia="Aún no hay observaciones registradas en esta revisión."
      observaciones={data}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onReintentar={() => void refetch()}
      onCerrar={onCerrar}
    />
  );
}
