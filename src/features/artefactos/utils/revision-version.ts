import type { VersionArtefacto } from '../models/VersionArtefacto';

export const ESTADO_REVISION_CERRADA = 'CERRADA';
export const ESTADO_REVISION_PENDIENTE = 'PENDIENTE';
export const ESTADO_REVISION_RESUELTA = 'RESUELTA';

export function tieneRevision(version: VersionArtefacto): boolean {
  return version.revisionAsesor !== null;
}

export function estadoPermiteGestionarObservaciones(version: VersionArtefacto): boolean {
  return version.estadoRevision === ESTADO_REVISION_PENDIENTE;
}

export function puedeGestionarObservaciones({
  version,
  artefactoOmitido,
}: {
  version: VersionArtefacto;
  artefactoOmitido: boolean;
}): boolean {
  return !artefactoOmitido && estadoPermiteGestionarObservaciones(version);
}

export function revisionAdmiteDecisionObservacion({
  version,
  artefactoOmitido,
}: {
  version: VersionArtefacto;
  artefactoOmitido: boolean;
}): boolean {
  return !artefactoOmitido && version.estadoRevision === ESTADO_REVISION_RESUELTA;
}

export function estudianteVeObservaciones(version: VersionArtefacto): boolean {
  return tieneRevision(version) && version.estadoRevision !== ESTADO_REVISION_PENDIENTE;
}

interface EntradaPuedeRegistrar {
  version: VersionArtefacto;
  ultimaVersionId: string | null | undefined;
  versionAnterior: VersionArtefacto | null | undefined;
  artefactoOmitido: boolean;
}

export function estadoPermiteRegistrarRevision(version: VersionArtefacto): boolean {
  return version.estadoRevision === null || version.estadoRevision === ESTADO_REVISION_CERRADA;
}

export function reabreArtefacto(version: VersionArtefacto): boolean {
  return version.estadoRevision === ESTADO_REVISION_CERRADA;
}

export function versionAnteriorPermiteRegistrar(
  version: VersionArtefacto,
  versionAnterior: VersionArtefacto | null | undefined,
): boolean {
  if (version.version <= 1) return true;
  return (
    versionAnterior?.version === version.version - 1 &&
    versionAnterior.estadoRevision === ESTADO_REVISION_RESUELTA
  );
}

export function puedeRegistrarRevision({
  version,
  ultimaVersionId,
  versionAnterior,
  artefactoOmitido,
}: EntradaPuedeRegistrar): boolean {
  return (
    !artefactoOmitido &&
    ultimaVersionId === version.id &&
    estadoPermiteRegistrarRevision(version) &&
    versionAnteriorPermiteRegistrar(version, versionAnterior)
  );
}
