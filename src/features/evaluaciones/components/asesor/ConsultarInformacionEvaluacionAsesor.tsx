import Badge from '../../../../shared/components/ui/Badge';
import Button from '../../../../shared/components/ui/Button';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import ListaPersonas from '../../../../shared/components/ui/ListaPersonas';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage, hasApiErrorCode } from '../../../../shared/utils/api-error';
import { varianteEstadoEvaluacion } from '../../../../shared/utils/estado-variante';
import type { EvaluacionAsesorRealizada } from '../../models/EvaluacionAsesorRealizada';
import {
  EVALUACION_CUALITATIVA_ASESOR_EVALUACION_ASESOR_NO_ENCONTRADA,
  EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR,
} from '../../utils/codigos-error-evaluaciones';

const CENTRADO = 'flex flex-col items-center gap-3';
const RAIZ = 'flex flex-col gap-6';
const DATOS = 'grid gap-4 sm:grid-cols-3';
const DATO = 'flex min-w-0 flex-col gap-1';
const ROTULO = 'text-[13px] font-medium text-on-surface-secondary';
const VALOR = 'break-words text-sm font-semibold text-on-surface';

export interface ConsultaEvaluacionAsesorRealizada {
  data?: EvaluacionAsesorRealizada;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => unknown;
}

interface Props {
  consulta: ConsultaEvaluacionAsesorRealizada;
  etiquetaVolver: string;
  onVolver: () => void;
}

export default function ConsultarInformacionEvaluacionAsesor({
  consulta,
  etiquetaVolver,
  onVolver,
}: Props) {
  const { data, isLoading, isError, error, refetch } = consulta;

  const volver = (
    <Button variante="secundario" onClick={onVolver}>
      {etiquetaVolver}
    </Button>
  );

  if (
    isError &&
    hasApiErrorCode(error, EVALUACION_CUALITATIVA_ASESOR_EVALUACION_ASESOR_NO_ENCONTRADA)
  ) {
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

  if (isError && hasApiErrorCode(error, EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR)) {
    return (
      <div className={CENTRADO}>
        <ErrorState
          titulo="No puedes consultar esta evaluación"
          descripcion="Solo el asesor asignado puede ver su información."
        />
        {volver}
      </div>
    );
  }

  if (isError) {
    return (
      <div className={CENTRADO}>
        <ErrorState
          titulo="No se pudo cargar la información de la evaluación"
          descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
          onReintentar={() => void refetch()}
        />
        {volver}
      </div>
    );
  }

  if (isLoading || !data) {
    return <Skeleton variante="lineas" etiqueta="Cargando la información de la evaluación" />;
  }

  const { entregable, estado } = data.evaluacion;

  return (
    <div className={RAIZ}>
      <dl className={DATOS}>
        <div className={DATO}>
          <dt className={ROTULO}>Proyecto</dt>
          <dd className={VALOR}>{entregable.proyecto}</dd>
        </div>
        <div className={DATO}>
          <dt className={ROTULO}>Versión</dt>
          <dd className={VALOR}>{entregable.version}</dd>
        </div>
        <div className={DATO}>
          <dt className={ROTULO}>Estado</dt>
          <dd>
            <Badge variante={varianteEstadoEvaluacion(estado.id)}>{estado.nombre}</Badge>
          </dd>
        </div>
      </dl>
      <ListaPersonas personas={[data.asesor]} etiqueta="Asesor de la evaluación" />
    </div>
  );
}
