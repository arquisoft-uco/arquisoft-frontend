import ErrorState from '../../../../shared/components/ui/ErrorState';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEvaluacionesAsignadasJurado } from '../../hooks/useEvaluacionesAsignadasJurado';
import EvaluacionesAsignadasJuradoTable from './EvaluacionesAsignadasJuradoTable';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(total: number): string {
  return `${total} ${total === 1 ? 'evaluación asignada' : 'evaluaciones asignadas'}`;
}

export default function ConsultarEvaluacionesAsignadasJurado() {
  const { data, isLoading, isError, error, isFetching, refetch } = useEvaluacionesAsignadasJurado();
  const evaluaciones = data ?? [];
  const resumen = isLoading || isError || !data ? '' : textoResumen(evaluaciones.length);

  return (
    <div className={RAIZ}>
      <p aria-live="polite" className={RESUMEN}>
        {resumen}
      </p>

      <div aria-busy={isFetching}>
        {isError ? (
          <ErrorState
            titulo="No se pudieron cargar tus evaluaciones"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <EvaluacionesAsignadasJuradoTable evaluaciones={evaluaciones} cargando={isLoading} />
        )}
      </div>
    </div>
  );
}
