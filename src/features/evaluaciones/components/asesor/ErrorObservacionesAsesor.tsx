import ErrorState from '../../../../shared/components/ui/ErrorState';
import { getApiErrorMessage, hasApiErrorCode } from '../../../../shared/utils/api-error';
import {
  EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR,
  OBSERVACION_ITEM_ASESOR_EVALUACION_NO_ENCONTRADA,
} from '../../utils/codigos-error-evaluaciones';

interface Props {
  error: unknown;
  onReintentar: () => void;
}

export default function ErrorObservacionesAsesor({ error, onReintentar }: Props) {
  if (hasApiErrorCode(error, OBSERVACION_ITEM_ASESOR_EVALUACION_NO_ENCONTRADA)) {
    return (
      <ErrorState
        titulo="Esta evaluación no está disponible"
        descripcion="Puede que ya no exista. Cierra el panel e inténtalo con otra."
      />
    );
  }
  if (hasApiErrorCode(error, EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR)) {
    return (
      <ErrorState
        titulo="No puedes consultar esta evaluación"
        descripcion="Esta evaluación no está asignada a tu usuario."
      />
    );
  }
  return (
    <ErrorState
      titulo="No se pudieron cargar las observaciones"
      descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
      onReintentar={onReintentar}
    />
  );
}
