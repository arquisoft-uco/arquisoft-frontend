import { ClipboardPen } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useHasRole } from '../../../../hooks/useHasRole';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import IconButton from '../../../../shared/components/ui/IconButton';
import { Rol } from '../../../../shared/models/rol';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEvaluacionesAsignadasJurado } from '../../hooks/useEvaluacionesAsignadasJurado';
import { ESTADO_FINALIZADA } from '../../utils/estados-evaluacion';
import EvaluacionesAsignadasJuradoTable from './EvaluacionesAsignadasJuradoTable';

const ROLES_REGISTRAN = [Rol.Jurado];
const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(total: number): string {
  return `${total} ${total === 1 ? 'evaluación asignada' : 'evaluaciones asignadas'}`;
}

export default function ConsultarEvaluacionesAsignadasJurado() {
  const navigate = useNavigate();
  const puedeEvaluar = useHasRole(ROLES_REGISTRAN);
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
          <EvaluacionesAsignadasJuradoTable
            evaluaciones={evaluaciones}
            cargando={isLoading}
            encabezadoAcciones={puedeEvaluar ? 'Acciones' : undefined}
            acciones={
              puedeEvaluar
                ? (asignacion) => (
                    <IconButton
                      etiqueta={`Evaluar ${asignacion.entregable.proyecto}`}
                      icono={ClipboardPen}
                      tono="primario"
                      rotulo="Evaluar"
                      disabled={asignacion.evaluacion.estado.id === ESTADO_FINALIZADA}
                      onClick={() => navigate(`/evaluaciones/${asignacion.id}/evaluar`)}
                    />
                  )
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
}
