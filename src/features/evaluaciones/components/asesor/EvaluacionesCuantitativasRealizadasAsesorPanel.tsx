import { useState } from 'react';
import Notice from '../../../../shared/components/ui/Notice';
import type { EvaluacionCuantitativaAsesor } from '../../models/EvaluacionCuantitativaAsesor';
import CambiarPuntajeEvaluacionCuantitativaAsesorPanel from './CambiarPuntajeEvaluacionCuantitativaAsesorPanel';
import ConsultarEvaluacionesCuantitativasAsesor from './ConsultarEvaluacionesCuantitativasAsesor';
import type { ConsultaCuantitativasAsesor } from './ConsultarEvaluacionesCuantitativasAsesor';

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

  if (finalizada) {
    return (
      <div className={RAIZ}>
        <Notice variante="advertencia">
          La evaluación ya fue finalizada; no se pueden cambiar valoraciones.
        </Notice>
        <ConsultarEvaluacionesCuantitativasAsesor
          consulta={consulta}
          etiquetaVolver={etiquetaVolver}
          onVolver={onVolver}
        />
      </div>
    );
  }

  return (
    <div className={RAIZ}>
      <ConsultarEvaluacionesCuantitativasAsesor
        consulta={consulta}
        etiquetaVolver={etiquetaVolver}
        onVolver={onVolver}
        onCambiarPuntaje={setFilaEnEdicion}
      />
      {filaEnEdicion && (
        <CambiarPuntajeEvaluacionCuantitativaAsesorPanel
          fila={filaEnEdicion}
          evaluacionAsesorId={evaluacionAsesorId}
          onCerrar={() => setFilaEnEdicion(null)}
        />
      )}
    </div>
  );
}
