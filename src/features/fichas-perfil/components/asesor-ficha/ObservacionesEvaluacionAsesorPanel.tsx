import { useObservacionesEvaluacionAsesor } from '../../hooks/useObservacionesEvaluacionAsesor';
import type { EvaluacionFichaPerfilAsesor } from '../../models/EvaluacionFichaPerfilAsesor';
import ObservacionesEvaluacionPanelBase from '../ObservacionesEvaluacionPanelBase';

interface Props {
  evaluacion: EvaluacionFichaPerfilAsesor;
  onCerrar: () => void;
}

export default function ObservacionesEvaluacionAsesorPanel({ evaluacion, onCerrar }: Props) {
  const { observaciones, isLoading, cargado, isError, error, refetch } =
    useObservacionesEvaluacionAsesor(evaluacion.fichaPerfilId, evaluacion.id);

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
