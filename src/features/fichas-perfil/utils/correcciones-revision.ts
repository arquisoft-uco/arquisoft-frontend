import type { ObservacionItem } from '../models/ObservacionItem';
import type { ResumenObservacionesRevision } from '../models/RevisionItem';
import { ESTADO_OBSERVACION_PENDIENTE, ESTADO_REVISION_VISUALIZADA } from './estado-revision';

export function resumirObservacionesPorRevision(
  revisionIds: string[],
  observaciones: ObservacionItem[],
): Map<string, ResumenObservacionesRevision> {
  const resumen = new Map<string, ResumenObservacionesRevision>(
    revisionIds.map((id) => [id, { total: 0, pendientes: 0 }]),
  );
  for (const observacion of observaciones) {
    const actual = resumen.get(observacion.revisionItemId);
    if (!actual) continue;
    actual.total += 1;
    if (observacion.estadoId === ESTADO_OBSERVACION_PENDIENTE) actual.pendientes += 1;
  }
  return resumen;
}

export function motivoCorreccionesNoDisponibles(
  estadoId: string,
  resumen: ResumenObservacionesRevision | undefined,
): string | null {
  if (estadoId === ESTADO_REVISION_VISUALIZADA) {
    return 'Edita el ítem para atender las observaciones y luego envía las correcciones.';
  }
  if (!resumen) return null;
  if (resumen.total === 0) return 'Tu asesor aún no dejó observaciones en esta revisión.';
  if (resumen.pendientes > 0) {
    const cantidad =
      resumen.pendientes === 1
        ? '1 observación pendiente'
        : `${resumen.pendientes} observaciones pendientes`;
    return `Tienes ${cantidad}: edita el ítem para atenderlas.`;
  }
  return null;
}
