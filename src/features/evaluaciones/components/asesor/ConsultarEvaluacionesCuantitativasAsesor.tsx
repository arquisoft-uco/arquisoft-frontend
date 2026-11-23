import type { ReactNode } from 'react';
import Button from '../../../../shared/components/ui/Button';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import { getApiErrorMessage, hasApiErrorCode } from '../../../../shared/utils/api-error';
import type { EvaluacionCuantitativaAsesor } from '../../models/EvaluacionCuantitativaAsesor';
import {
  EVALUACION_CUALITATIVA_ASESOR_EVALUACION_ASESOR_NO_ENCONTRADA,
  EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR,
} from '../../utils/codigos-error-evaluaciones';
import type { SeleccionCuantitativas } from '../EvaluacionesCuantitativasJuradoTable';
import EvaluacionesCuantitativasAsesorTable from './EvaluacionesCuantitativasAsesorTable';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';
const ERROR = 'flex flex-col items-center gap-3';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'evaluación cuantitativa' : 'evaluaciones cuantitativas'}`;
}

export interface ConsultaCuantitativasAsesor {
  data?: EvaluacionCuantitativaAsesor[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => unknown;
}

interface Props {
  consulta: ConsultaCuantitativasAsesor;
  etiquetaVolver: string;
  onVolver: () => void;
  seleccion?: SeleccionCuantitativas;
  acciones?: (fila: EvaluacionCuantitativaAsesor) => ReactNode;
  celdaPuntaje?: (fila: EvaluacionCuantitativaAsesor) => ReactNode;
}

export default function ConsultarEvaluacionesCuantitativasAsesor({
  consulta,
  etiquetaVolver,
  onVolver,
  seleccion,
  acciones,
  celdaPuntaje,
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
      <EvaluacionesCuantitativasAsesorTable
        evaluaciones={data ?? []}
        cargando={isLoading}
        seleccion={seleccion}
        acciones={acciones}
        celdaPuntaje={celdaPuntaje}
      />
    </div>
  );
}
