import { ClipboardX } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import { getApiErrorMessage, hasApiErrorCode } from '../../../../shared/utils/api-error';
import { useEvaluacionesCuantitativasJurado } from '../../hooks/useEvaluacionesCuantitativasJurado';
import { EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_NO_ENCONTRADA } from '../../utils/codigos-error-evaluaciones';
import EvaluacionesCuantitativasJuradoTable from './EvaluacionesCuantitativasJuradoTable';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'evaluación cuantitativa' : 'evaluaciones cuantitativas'}`;
}

interface Props {
  evaluacionJuradoId: string;
  onVolver: () => void;
}

export default function ConsultarEvaluacionesCuantitativasJurado({
  evaluacionJuradoId,
  onVolver,
}: Props) {
  const { data, isLoading, isError, error, refetch } =
    useEvaluacionesCuantitativasJurado(evaluacionJuradoId);

  if (isError) {
    const volver = (
      <Button variante="secundario" onClick={onVolver}>
        Volver a los jurados
      </Button>
    );
    if (hasApiErrorCode(error, EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_NO_ENCONTRADA)) {
      return (
        <EmptyState
          icono={ClipboardX}
          titulo="Esta evaluación del jurado no está disponible"
          descripcion="Puede que ya no exista. Vuelve a la lista de jurados."
          accion={volver}
        />
      );
    }
    return (
      <div className="flex flex-col items-center gap-3">
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
      <EvaluacionesCuantitativasJuradoTable evaluaciones={data ?? []} cargando={isLoading} />
    </div>
  );
}
