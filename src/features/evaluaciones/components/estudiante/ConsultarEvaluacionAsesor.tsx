import { UserX } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import ListaPersonas from '../../../../shared/components/ui/ListaPersonas';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage, hasApiErrorCode } from '../../../../shared/utils/api-error';
import type { EvaluacionAsesor } from '../../models/EvaluacionAsesor';
import {
  EVALUACION_ASESOR_SIN_EVALUACION_ASESOR,
  EVALUACION_NO_ENCONTRADA,
} from '../../utils/codigos-error-evaluaciones';

const CENTRADO = 'flex flex-col items-center gap-3';

export interface ConsultaEvaluacionAsesor {
  data?: EvaluacionAsesor;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => unknown;
}

interface Props {
  consulta: ConsultaEvaluacionAsesor;
  onVolver: () => void;
}

export default function ConsultarEvaluacionAsesor({ consulta, onVolver }: Props) {
  const { data, isLoading, isError, error, refetch } = consulta;

  const volver = (
    <Button variante="secundario" onClick={onVolver}>
      Volver a evaluaciones
    </Button>
  );

  if (isError && hasApiErrorCode(error, EVALUACION_ASESOR_SIN_EVALUACION_ASESOR)) {
    return (
      <EmptyState
        icono={UserX}
        titulo="Esta evaluación aún no tiene evaluación del asesor"
        descripcion="Aparecerá aquí cuando el asesor la registre."
        accion={volver}
      />
    );
  }

  if (isError && hasApiErrorCode(error, EVALUACION_NO_ENCONTRADA)) {
    return (
      <div className={CENTRADO}>
        <ErrorState
          titulo="Esta evaluación no está disponible"
          descripcion="Puede que ya no exista. Vuelve e inténtalo con otra."
        />
        {volver}
      </div>
    );
  }

  if (isError) {
    return (
      <div className={CENTRADO}>
        <ErrorState
          titulo="No se pudo cargar la evaluación del asesor"
          descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
          onReintentar={() => void refetch()}
        />
        {volver}
      </div>
    );
  }

  if (isLoading || !data) {
    return <Skeleton variante="lineas" etiqueta="Cargando la evaluación del asesor" />;
  }

  return <ListaPersonas personas={[data.asesor]} etiqueta="Asesor de la evaluación" />;
}
