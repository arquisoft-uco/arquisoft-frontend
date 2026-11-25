import { useState } from 'react';
import { useObservacionesEvaluacionRepresentante } from '../../hooks/useObservacionesEvaluacionRepresentante';
import type { EvaluacionFichaPerfil } from '../../models/fichas-perfil';
import type { ObservacionEvaluacion } from '../../models/ObservacionEvaluacion';
import { evaluacionDescartada, evaluacionEnEstadoFinal } from '../../utils/evaluacion-asistente';
import ObservacionesEvaluacionPanelBase from '../ObservacionesEvaluacionPanelBase';
import EditarObservacionEvaluacionForm from './EditarObservacionEvaluacionForm';
import EliminarObservacionEvaluacionDialogo from './EliminarObservacionEvaluacionDialogo';

interface Props {
  evaluacion: EvaluacionFichaPerfil;
  fichaDisponible: boolean;
  onCerrar: () => void;
}

export default function ObservacionesEvaluacionRepresentantePanel({
  evaluacion,
  fichaDisponible,
  onCerrar,
}: Props) {
  const [enEdicion, setEnEdicion] = useState<ObservacionEvaluacion | null>(null);
  const [porEliminar, setPorEliminar] = useState<ObservacionEvaluacion | null>(null);
  const { observaciones, isLoading, cargado, isError, error, refetch } =
    useObservacionesEvaluacionRepresentante(evaluacion.fichaPerfilId, evaluacion.id);

  const descartada = evaluacionDescartada(evaluacion);

  return (
    <>
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
        onEditar={descartada || !fichaDisponible ? undefined : setEnEdicion}
        onEliminar={
          descartada || !fichaDisponible || evaluacionEnEstadoFinal(evaluacion)
            ? undefined
            : setPorEliminar
        }
      />
      {enEdicion && (
        <EditarObservacionEvaluacionForm
          observacion={enEdicion}
          fichaPerfilId={evaluacion.fichaPerfilId}
          onCerrar={() => setEnEdicion(null)}
        />
      )}
      {porEliminar && (
        <EliminarObservacionEvaluacionDialogo
          observacion={porEliminar}
          fichaPerfilId={evaluacion.fichaPerfilId}
          evaluacionId={evaluacion.id}
          onCerrar={() => setPorEliminar(null)}
        />
      )}
    </>
  );
}
