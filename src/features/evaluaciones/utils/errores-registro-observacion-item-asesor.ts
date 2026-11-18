import { hasApiErrorCode } from '../../../shared/utils/api-error';
import {
  EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR,
  EVALUACION_ESTADO_FINALIZADA,
  OBSERVACION_ITEM_ASESOR_EVALUACION_NO_ENCONTRADA,
} from './codigos-error-evaluaciones';

export function cierraPanelRegistrarObservacionItemAsesor(err: unknown): boolean {
  return (
    hasApiErrorCode(err, OBSERVACION_ITEM_ASESOR_EVALUACION_NO_ENCONTRADA) ||
    hasApiErrorCode(err, EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR) ||
    hasApiErrorCode(err, EVALUACION_ESTADO_FINALIZADA)
  );
}
