import { useId } from 'react';
import { ClipboardList } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import { getApiErrorMessage, hasApiErrorCode } from '../../../../shared/utils/api-error';
import { useEvaluacionesCuantitativasAsesorEstudiante } from '../../hooks/useEvaluacionesCuantitativasAsesorEstudiante';
import {
  EVALUACION_ASESOR_NO_PERTENECE_ESTUDIANTE,
  EVALUACION_CUALITATIVA_ASESOR_EVALUACION_ASESOR_NO_ENCONTRADA,
} from '../../utils/codigos-error-evaluaciones';
import EvaluacionesCuantitativasJuradoTable from '../EvaluacionesCuantitativasJuradoTable';

const RAIZ = 'flex flex-col gap-3';
const TITULO = 'text-base font-semibold text-on-surface';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';
const CENTRADO = 'flex flex-col items-center gap-3';
const ETIQUETA_TABLA = 'Evaluaciones cuantitativas del asesor';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'evaluación cuantitativa' : 'evaluaciones cuantitativas'}`;
}

interface Props {
  evaluacionAsesorId: string;
  onVolver: () => void;
}

export default function ConsultarEvaluacionesCuantitativasAsesorEstudiante({
  evaluacionAsesorId,
  onVolver,
}: Props) {
  const idTitulo = useId();
  const { data, isLoading, isError, error, refetch } =
    useEvaluacionesCuantitativasAsesorEstudiante(evaluacionAsesorId);

  const volver = (
    <Button variante="secundario" onClick={onVolver}>
      Volver a evaluaciones
    </Button>
  );

  function cuerpo() {
    if (
      isError &&
      hasApiErrorCode(error, EVALUACION_CUALITATIVA_ASESOR_EVALUACION_ASESOR_NO_ENCONTRADA)
    ) {
      return (
        <div className={CENTRADO}>
          <ErrorState
            titulo="Esta evaluación del asesor no está disponible"
            descripcion="Puede que ya no exista. Vuelve e inténtalo con otra."
          />
          {volver}
        </div>
      );
    }
    if (isError && hasApiErrorCode(error, EVALUACION_ASESOR_NO_PERTENECE_ESTUDIANTE)) {
      return (
        <div className={CENTRADO}>
          <ErrorState
            titulo="No puedes consultar esta evaluación"
            descripcion="La evaluación del asesor no corresponde a un proyecto del que haces parte."
          />
          {volver}
        </div>
      );
    }
    if (isError) {
      return (
        <div className={CENTRADO}>
          <ErrorState
            titulo="No se pudieron cargar las evaluaciones del asesor"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={() => void refetch()}
          />
          {volver}
        </div>
      );
    }
    return (
      <>
        <p aria-live="polite" className={RESUMEN}>
          {textoResumen(data?.length)}
        </p>
        <EvaluacionesCuantitativasJuradoTable
          evaluaciones={data ?? []}
          cargando={isLoading}
          etiqueta={ETIQUETA_TABLA}
          vacio={
            <EmptyState
              icono={ClipboardList}
              titulo="Aún no hay evaluaciones cuantitativas del asesor"
              descripcion="Aparecerán aquí cuando el asesor registre sus puntajes."
            />
          }
        />
      </>
    );
  }

  return (
    <section aria-labelledby={idTitulo} className={RAIZ}>
      <h2 id={idTitulo} className={TITULO}>
        Evaluaciones cuantitativas del asesor
      </h2>
      {cuerpo()}
    </section>
  );
}
