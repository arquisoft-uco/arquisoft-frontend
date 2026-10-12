import { useObservacionesEvaluacionCoordinador } from '../../hooks/useObservacionesEvaluacionCoordinador';
import type { EvaluacionFichaPerfilEstudiante } from '../../models/EvaluacionFichaPerfilEstudiante';
import ObservacionesEvaluacionPanelBase from '../ObservacionesEvaluacionPanelBase';

interface Props {
  evaluacion: EvaluacionFichaPerfilEstudiante;
  onCerrar: () => void;
}

export default function ObservacionesEvaluacionCoordinadorPanel({ evaluacion, onCerrar }: Props) {
  const { observaciones, isLoading, cargado, isError, error, refetch } =
    useObservacionesEvaluacionCoordinador(evaluacion.fichaPerfilId, evaluacion.id);

  return (
    <ObservacionesEvaluacionPanelBase
      descripcion={`Evaluada por ${evaluacion.representante.nombre}`}
      estadoId={evaluacion.estadoEvaluacionId}
      estadoNombre={evaluacion.estadoEvaluacionNombre}
      observaciones={observaciones}
      isLoading={isLoading}
      cargado={cargado}
      isError={isError}
      error={error}
      onReintentar={refetch}
      descripcionVacia="Cuando el comité las registre, las verás aquí."
      onCerrar={onCerrar}
    />
  );
}
