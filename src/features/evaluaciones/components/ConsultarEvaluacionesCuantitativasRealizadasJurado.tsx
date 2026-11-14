import { useState } from 'react';
import { Calculator } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import EmptyState from '../../../shared/components/ui/EmptyState';
import ErrorState from '../../../shared/components/ui/ErrorState';
import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import type { EvaluacionCuantitativaJurado } from '../models/EvaluacionCuantitativaJurado';
import {
  EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_NO_ENCONTRADA,
  EVALUACION_CUALITATIVA_JURADO_NO_PERTENECE_JURADO,
} from '../utils/codigos-error-evaluaciones';
import type { ObservacionItemJurado } from '../models/ObservacionItemJurado';
import ModificarObservacionItemJuradoPanel from './jurado/ModificarObservacionItemJuradoPanel';
import ObservacionesItemJuradoPanel from './jurado/ObservacionesItemJuradoPanel';
import EvaluacionesCuantitativasJuradoTable from './EvaluacionesCuantitativasJuradoTable';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';
const ERROR = 'flex flex-col items-center gap-3';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'evaluación cuantitativa' : 'evaluaciones cuantitativas'}`;
}

export interface ConsultaCuantitativas {
  data?: EvaluacionCuantitativaJurado[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => unknown;
}

interface Props {
  consulta: ConsultaCuantitativas;
  etiquetaVolver: string;
  onVolver: () => void;
  onEvaluar?: () => void;
  evaluacionFinalizada?: boolean;
}

type PanelAbierto =
  | { tipo: 'lectura'; valoracion: EvaluacionCuantitativaJurado }
  | {
      tipo: 'edicion';
      valoracion: EvaluacionCuantitativaJurado;
      observacion: ObservacionItemJurado;
    };

export default function ConsultarEvaluacionesCuantitativasRealizadasJurado({
  consulta,
  etiquetaVolver,
  onVolver,
  onEvaluar,
  evaluacionFinalizada = false,
}: Props) {
  const [panel, setPanel] = useState<PanelAbierto | null>(null);
  const { data, isLoading, isError, error, refetch } = consulta;

  if (isError) {
    const volver = (
      <Button variante="secundario" onClick={onVolver}>
        {etiquetaVolver}
      </Button>
    );
    if (hasApiErrorCode(error, EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_NO_ENCONTRADA)) {
      return (
        <div className={ERROR}>
          <ErrorState
            titulo="Esta evaluación no está disponible"
            descripcion="Puede que ya no exista. Vuelve e inténtalo con otra."
          />
          {volver}
        </div>
      );
    }
    if (hasApiErrorCode(error, EVALUACION_CUALITATIVA_JURADO_NO_PERTENECE_JURADO)) {
      return (
        <div className={ERROR}>
          <ErrorState
            titulo="No puedes consultar esta evaluación"
            descripcion="Esta evaluación no está asignada a tu usuario."
          />
          {volver}
        </div>
      );
    }
    return (
      <div className={ERROR}>
        <ErrorState
          titulo="No se pudieron cargar las evaluaciones"
          descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
          onReintentar={() => void refetch()}
        />
        {volver}
      </div>
    );
  }

  const vacio = (
    <EmptyState
      icono={Calculator}
      titulo="Aún no registraste evaluaciones cuantitativas"
      descripcion="Aparecerán aquí cuando registres tus puntajes."
      accion={onEvaluar && <Button onClick={onEvaluar}>Evaluar cuantitativas</Button>}
    />
  );

  return (
    <div className={RAIZ}>
      <p aria-live="polite" className={RESUMEN}>
        {textoResumen(data?.length)}
      </p>
      <EvaluacionesCuantitativasJuradoTable
        evaluaciones={data ?? []}
        cargando={isLoading}
        vacio={vacio}
        onVerObservaciones={(valoracion) => setPanel({ tipo: 'lectura', valoracion })}
      />
      {panel?.tipo === 'lectura' && (
        <ObservacionesItemJuradoPanel
          valoracion={panel.valoracion}
          puedeModificar={!evaluacionFinalizada}
          onModificar={(observacion) =>
            setPanel({ tipo: 'edicion', valoracion: panel.valoracion, observacion })
          }
          onCerrar={() => setPanel(null)}
        />
      )}
      {panel?.tipo === 'edicion' && (
        <ModificarObservacionItemJuradoPanel
          observacion={panel.observacion}
          nombreItem={panel.valoracion.item.nombre}
          onCerrar={() => setPanel({ tipo: 'lectura', valoracion: panel.valoracion })}
        />
      )}
    </div>
  );
}
