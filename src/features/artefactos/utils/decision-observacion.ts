import type { VersionArtefacto } from '../models/VersionArtefacto';
import { ESTADO_REVISION_PENDIENTE } from './revision-version';

export const ESTADO_OBSERVACION_SOLUCIONADA = 'SOLUCIONADA';
export const ESTADO_OBSERVACION_CERRADA = 'CERRADA';
export const ESTADO_OBSERVACION_REABIERTA = 'REABIERTA';

export type SituacionReapertura =
  | 'cargando'
  | 'disponible'
  | 'sin-version-siguiente'
  | 'version-no-inmediata'
  | 'sin-revision'
  | 'revision-enviada';

export function situacionReapertura({
  version,
  ultimaVersion,
}: {
  version: VersionArtefacto;
  ultimaVersion: VersionArtefacto | null | undefined;
}): SituacionReapertura {
  if (ultimaVersion === undefined) return 'cargando';
  if (ultimaVersion === null || ultimaVersion.version <= version.version) {
    return 'sin-version-siguiente';
  }
  if (ultimaVersion.version > version.version + 1) return 'version-no-inmediata';
  if (ultimaVersion.revisionAsesor === null) return 'sin-revision';
  if (ultimaVersion.estadoRevision !== ESTADO_REVISION_PENDIENTE) return 'revision-enviada';
  return 'disponible';
}

export function textoSituacionReapertura(
  situacion: SituacionReapertura,
  version: VersionArtefacto,
): string | null {
  const siguiente = version.version + 1;
  switch (situacion) {
    case 'sin-version-siguiente':
      return `Para reabrir observaciones, el estudiante debe subir la versión ${siguiente}.`;
    case 'sin-revision':
      return `Para reabrir observaciones, registra primero la revisión de la versión ${siguiente}.`;
    case 'revision-enviada':
      return `La revisión de la versión ${siguiente} ya se envió: agrega lo pendiente como observación nueva en esa revisión.`;
    case 'version-no-inmediata':
      return 'Solo se pueden reabrir observaciones de la versión inmediatamente anterior a la última.';
    default:
      return null;
  }
}
