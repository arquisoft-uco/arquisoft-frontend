import type { VersionRepositorioArtefacto } from '../../../shared/models/VersionRepositorioArtefacto';

export function esUltimaVersionDelDocumento(
  version: VersionRepositorioArtefacto,
  versiones: VersionRepositorioArtefacto[],
): boolean {
  return !versiones.some(
    (otra) =>
      otra.nombreDocumento === version.nombreDocumento &&
      otra.numeroVersion > version.numeroVersion,
  );
}
