import { useObservacionesEvaluacionRepresentante } from '../../hooks/useObservacionesEvaluacionRepresentante';
import type { EvaluacionFichaPerfil } from '../../models/fichas-perfil';
import ObservacionesEvaluacionPanelBase from '../ObservacionesEvaluacionPanelBase';

interface Props {
  evaluacion: EvaluacionFichaPerfil;
  onCerrar: () => void;
}

export default function ObservacionesEvaluacionRepresentantePanel({ evaluacion, onCerrar }: Props) {
  const { observaciones, isLoading, cargado, isError, error, refetch } =
    useObservacionesEvaluacionRepresentante(evaluacion.fichaPerfilId, evaluacion.id);

  return (
    <ObservacionesEvaluacionPanelBase
      descripcion="Observaciones que registraste en esta evaluación"
      estadoId={evaluacion.estadoEvaluacionId}
      estadoNombre={evaluacion.estadoEvaluacionNombre}
      observaciones={observaciones}
      isLoading={isLoading}
      cargado={cargado}
      isError={isError}
      error={error}
      onReintentar={refetch}
      descripcionVacia="Cuando las registres, las verás aquí."
      onCerrar={onCerrar}
    />
  );
}
