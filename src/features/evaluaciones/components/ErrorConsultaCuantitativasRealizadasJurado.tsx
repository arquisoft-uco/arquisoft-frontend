import Button from '../../../shared/components/ui/Button';
import ErrorState from '../../../shared/components/ui/ErrorState';
import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import {
  EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_NO_ENCONTRADA,
  EVALUACION_CUALITATIVA_JURADO_NO_PERTENECE_JURADO,
} from '../utils/codigos-error-evaluaciones';

const RAIZ = 'flex flex-col items-center gap-3';

interface Props {
  error: unknown;
  etiquetaVolver: string;
  onVolver: () => void;
  onReintentar: () => void;
}

export default function ErrorConsultaCuantitativasRealizadasJurado({
  error,
  etiquetaVolver,
  onVolver,
  onReintentar,
}: Props) {
  const volver = (
    <Button variante="secundario" onClick={onVolver}>
      {etiquetaVolver}
    </Button>
  );
  if (hasApiErrorCode(error, EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_NO_ENCONTRADA)) {
    return (
      <div className={RAIZ}>
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
      <div className={RAIZ}>
        <ErrorState
          titulo="No puedes consultar esta evaluación"
          descripcion="Esta evaluación no está asignada a tu usuario."
        />
        {volver}
      </div>
    );
  }
  return (
    <div className={RAIZ}>
      <ErrorState
        titulo="No se pudieron cargar las evaluaciones"
        descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
        onReintentar={onReintentar}
      />
      {volver}
    </div>
  );
}
