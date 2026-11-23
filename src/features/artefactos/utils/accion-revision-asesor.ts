import type { VersionArtefacto } from '../models/VersionArtefacto';
import { ESTADO_REVISION_PENDIENTE, puedeRegistrarRevision } from './revision-version';

export type AccionRevisionAsesor =
  | { tipo: 'registrar'; version: VersionArtefacto }
  | { tipo: 'gestionar'; version: VersionArtefacto; revisionAsesorId: string };

export function gestionarRevision(version: VersionArtefacto): AccionRevisionAsesor | null {
  const revisionAsesorId = version.revisionAsesor;
  return revisionAsesorId === null ? null : { tipo: 'gestionar', version, revisionAsesorId };
}

export function gestionarRevisionRegistrada(
  version: VersionArtefacto,
  revisionAsesorId: string,
): AccionRevisionAsesor {
  return {
    tipo: 'gestionar',
    revisionAsesorId,
    version: {
      ...version,
      revisionAsesor: revisionAsesorId,
      estadoRevision: ESTADO_REVISION_PENDIENTE,
      nombreEstadoRevision: 'Pendiente',
      fechaCreacionRevision: null,
    },
  };
}

interface EntradaArtefacto {
  ultima: VersionArtefacto | null | undefined;
  anterior: VersionArtefacto | null | undefined;
  artefactoOmitido: boolean;
  proyectoCerrado: boolean;
}

// La revisión vigente es la de la última versión; si aún no existe, se registra cuando el ciclo
// lo permite y, si no, sigue vigente la de la versión anterior (el estudiante aún la atiende).
export function accionRevisionDelArtefacto({
  ultima,
  anterior,
  artefactoOmitido,
  proyectoCerrado,
}: EntradaArtefacto): AccionRevisionAsesor | null {
  if (artefactoOmitido || !ultima) return null;
  const vigente = gestionarRevision(ultima);
  if (vigente) return vigente;
  const registrable =
    !proyectoCerrado &&
    puedeRegistrarRevision({
      version: ultima,
      ultimaVersionId: ultima.id,
      versionAnterior: anterior,
      artefactoOmitido,
    });
  if (registrable) return { tipo: 'registrar', version: ultima };
  return anterior ? gestionarRevision(anterior) : null;
}
