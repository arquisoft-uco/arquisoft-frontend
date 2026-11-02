import type { VersionArtefacto } from '../models/VersionArtefacto';

export const ESTADO_REVISION_EN_PROGRESO = 'EN_PROGRESO';
export const ESTADO_REVISION_RESUELTA = 'RESUELTA';

export function esRevisionResoluble(
  version: Pick<VersionArtefacto, 'revisionAsesor' | 'estadoRevision'>,
): boolean {
  return version.revisionAsesor !== null && version.estadoRevision === ESTADO_REVISION_EN_PROGRESO;
}
