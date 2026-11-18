import { useState } from 'react';
import Notice from '../../../../shared/components/ui/Notice';
import type { EvaluacionCuantitativaAsesor } from '../../models/EvaluacionCuantitativaAsesor';
import type { ObservacionItemAsesor } from '../../models/ObservacionItemAsesor';
import CambiarPuntajeEvaluacionCuantitativaAsesorPanel from './CambiarPuntajeEvaluacionCuantitativaAsesorPanel';
import ConsultarEvaluacionesCuantitativasAsesor from './ConsultarEvaluacionesCuantitativasAsesor';
import type { ConsultaCuantitativasAsesor } from './ConsultarEvaluacionesCuantitativasAsesor';
import ModificarObservacionItemAsesorPanel from './ModificarObservacionItemAsesorPanel';
import RegistrarObservacionItemAsesorPanel from './RegistrarObservacionItemAsesorPanel';
import ObservacionesEvaluacionCuantitativaAsesorPanel from './ObservacionesEvaluacionCuantitativaAsesorPanel';

const RAIZ = 'flex flex-col gap-4';

interface Props {
  evaluacionAsesorId: string;
  consulta: ConsultaCuantitativasAsesor;
  finalizada: boolean;
  etiquetaVolver: string;
  onVolver: () => void;
}

export default function EvaluacionesCuantitativasRealizadasAsesorPanel({
  evaluacionAsesorId,
  consulta,
  finalizada,
  etiquetaVolver,
  onVolver,
}: Props) {
  const [filaEnEdicion, setFilaEnEdicion] = useState<EvaluacionCuantitativaAsesor | null>(null);
  const [filaEnLectura, setFilaEnLectura] = useState<EvaluacionCuantitativaAsesor | null>(null);
  const [registrandoObservacion, setRegistrandoObservacion] = useState(false);
  const [observacionEnEdicion, setObservacionEnEdicion] = useState<ObservacionItemAsesor | null>(
    null,
  );

  function cerrarObservaciones() {
    setFilaEnLectura(null);
    setRegistrandoObservacion(false);
    setObservacionEnEdicion(null);
  }

  return (
    <div className={RAIZ}>
      {finalizada && (
        <Notice variante="advertencia">
          La evaluación ya fue finalizada; no se pueden cambiar valoraciones ni registrar o
          modificar observaciones.
        </Notice>
      )}
      <ConsultarEvaluacionesCuantitativasAsesor
        consulta={consulta}
        etiquetaVolver={etiquetaVolver}
        onVolver={onVolver}
        onVerObservaciones={setFilaEnLectura}
        onCambiarPuntaje={finalizada ? undefined : setFilaEnEdicion}
      />
      {!finalizada && filaEnEdicion && (
        <CambiarPuntajeEvaluacionCuantitativaAsesorPanel
          fila={filaEnEdicion}
          evaluacionAsesorId={evaluacionAsesorId}
          onCerrar={() => setFilaEnEdicion(null)}
        />
      )}
      {filaEnLectura && (
        <ObservacionesEvaluacionCuantitativaAsesorPanel
          evaluacion={filaEnLectura}
          puedeRegistrar={!finalizada}
          onRegistrar={() => setRegistrandoObservacion(true)}
          puedeModificar={!finalizada}
          onModificar={setObservacionEnEdicion}
          onCerrar={cerrarObservaciones}
        />
      )}
      {!finalizada && filaEnLectura && registrandoObservacion && (
        <RegistrarObservacionItemAsesorPanel
          evaluacion={filaEnLectura}
          onCerrar={() => setRegistrandoObservacion(false)}
        />
      )}
      {!finalizada && filaEnLectura && observacionEnEdicion && (
        <ModificarObservacionItemAsesorPanel
          observacion={observacionEnEdicion}
          nombreItem={filaEnLectura.item.nombre}
          onCerrar={() => setObservacionEnEdicion(null)}
        />
      )}
    </div>
  );
}
