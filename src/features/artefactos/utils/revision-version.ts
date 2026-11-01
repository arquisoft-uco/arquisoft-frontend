import type { VersionArtefacto } from '../models/VersionArtefacto';

export const ESTADO_REVISION_CERRADA = 'CERRADA';

interface EntradaPuedeRegistrar {
  version: VersionArtefacto;
  ultimaVersionId: string | null | undefined;
  artefactoOmitido: boolean;
}

export function estadoPermiteRegistrarRevision(version: VersionArtefacto): boolean {
  return version.estadoRevision === null || version.estadoRevision === ESTADO_REVISION_CERRADA;
}

export function reabreArtefacto(version: VersionArtefacto): boolean {
  return version.estadoRevision === ESTADO_REVISION_CERRADA;
}

export function puedeRegistrarRevision({
  version,
  ultimaVersionId,
  artefactoOmitido,
}: EntradaPuedeRegistrar): boolean {
  return (
    !artefactoOmitido && ultimaVersionId === version.id && estadoPermiteRegistrarRevision(version)
  );
}
