import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';

const MENSAJES_POR_CODIGO: Record<string, string> = {
  REVISION_ITEM_NO_ENCONTRADA: 'La revisión ya no existe.',
  FICHA_NO_PROPIETARIO: 'Esta revisión no pertenece a tu ficha.',
  REVISION_ITEM_CERRADA: 'La revisión está cerrada y ya no admite cambios.',
  REVISION_ITEM_NO_EN_PROGRESO: 'La revisión debe estar en progreso para enviar las correcciones.',
  REVISION_ITEM_SIN_OBSERVACIONES: 'Tu asesor aún no dejó observaciones en esta revisión.',
  REVISION_ITEM_CON_OBSERVACIONES_PENDIENTES:
    'Aún tienes observaciones pendientes: edita el ítem para atenderlas.',
};

export function mensajeErrorCorrecciones(err: unknown): string {
  const codigo = Object.keys(MENSAJES_POR_CODIGO).find((c) => hasApiErrorCode(err, c));
  if (codigo) return MENSAJES_POR_CODIGO[codigo];
  return getApiErrorMessage(err, 'No se pudieron enviar las correcciones.');
}
