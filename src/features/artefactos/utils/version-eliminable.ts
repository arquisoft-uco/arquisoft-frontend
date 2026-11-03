import type { VersionArtefacto } from '../models/VersionArtefacto';
import { ESTADO_REVISION_EN_PROGRESO } from './revision-resoluble';
import { tieneRevision } from './revision-version';

export function esVersionEliminable(
  version: VersionArtefacto,
  ultimas: VersionArtefacto[],
): boolean {
  const ultima = ultimas[0];
  if (!ultima || ultima.id !== version.id || tieneRevision(ultima)) return false;
  if (ultima.version === 1) return true;
  const anterior = ultimas[1];
  return (
    anterior?.version === ultima.version - 1 &&
    anterior.estadoRevision === ESTADO_REVISION_EN_PROGRESO
  );
}
