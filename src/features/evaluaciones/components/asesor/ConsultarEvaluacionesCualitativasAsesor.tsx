import type { ReactNode } from 'react';
import Button from '../../../../shared/components/ui/Button';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import { getApiErrorMessage, hasApiErrorCode } from '../../../../shared/utils/api-error';
import type { EvaluacionCualitativaAsesor } from '../../models/EvaluacionCualitativaAsesor';
import {
  EVALUACION_CUALITATIVA_ASESOR_EVALUACION_ASESOR_NO_ENCONTRADA,
  EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR,
} from '../../utils/codigos-error-evaluaciones';
import type { SeleccionCualitativas } from '../EvaluacionesCualitativasJuradoTable';
import EvaluacionesCualitativasAsesorTable from './EvaluacionesCualitativasAsesorTable';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';
const ERROR = 'flex flex-col items-center gap-3';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'evaluación cualitativa' : 'evaluaciones cualitativas'}`;
}

export interface ConsultaCualitativasAsesor {
  data?: EvaluacionCualitativaAsesor[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => unknown;
}

interface Props {
  consulta: ConsultaCualitativasAsesor;
  etiquetaVolver: string;
  onVolver: () => void;
  seleccion?: SeleccionCualitativas;
  acciones?: (fila: EvaluacionCualitativaAsesor) => ReactNode;
  celdaCriterio?: (fila: EvaluacionCualitativaAsesor) => ReactNode;
}

export default function ConsultarEvaluacionesCualitativasAsesor({
  consulta,
  etiquetaVolver,
  onVolver,
  seleccion,
  acciones,
  celdaCriterio,
}: Props) {
  const { data, isLoading, isError, error, refetch } = consulta;

  if (isError) {
    const volver = (
      <Button variante="secundario" onClick={onVolver}>
        {etiquetaVolver}
      </Button>
    );
    if (hasApiErrorCode(error, EVALUACION_CUALITATIVA_ASESOR_EVALUACION_ASESOR_NO_ENCONTRADA)) {
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
    if (hasApiErrorCode(error, EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR)) {
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

  return (
    <div className={RAIZ}>
      <p aria-live="polite" className={RESUMEN}>
        {textoResumen(data?.length)}
      </p>
      <EvaluacionesCualitativasAsesorTable
        evaluaciones={data ?? []}
        cargando={isLoading}
        seleccion={seleccion}
        acciones={acciones}
        celdaCriterio={celdaCriterio}
      />
    </div>
  );
}
