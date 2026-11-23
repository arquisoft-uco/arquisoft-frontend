import type { VersionArtefacto } from '../models/VersionArtefacto';

export const SIN_DOCUMENTO_CARGADO = 'Sin documento cargado';

type UltimaVersion = (artefactoId: string) => VersionArtefacto | null | undefined;

export function etiquetaVersionDocumento(
  artefacto: { id: string; versionDocumento: number },
  ultimaVersion: UltimaVersion,
  sufijo = '',
): string {
  if (ultimaVersion(artefacto.id) === null) return SIN_DOCUMENTO_CARGADO;
  return `Versión ${artefacto.versionDocumento}${sufijo}`;
}
