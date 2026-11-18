import { hasApiErrorCode } from '../../../shared/utils/api-error';
import {
  EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR,
  OBSERVACION_ITEM_ASESOR_MODIFICACION_EVALUACION_FINALIZADA,
  OBSERVACION_ITEM_ASESOR_NO_ENCONTRADA,
} from './codigos-error-evaluaciones';

export function cierraPanelModificarObservacionItemAsesor(err: unknown): boolean {
  return (
    hasApiErrorCode(err, OBSERVACION_ITEM_ASESOR_NO_ENCONTRADA) ||
    hasApiErrorCode(err, EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR) ||
    hasApiErrorCode(err, OBSERVACION_ITEM_ASESOR_MODIFICACION_EVALUACION_FINALIZADA)
  );
}
