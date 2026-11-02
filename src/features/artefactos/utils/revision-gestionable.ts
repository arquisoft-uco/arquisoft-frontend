import type { RevisionAsesorEstudiante } from '../models/RevisionAsesorEstudiante';
import type { RevisionGestionable } from '../models/RevisionGestionable';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { estudianteVeObservaciones } from './revision-version';

export function desRevision(revision: RevisionAsesorEstudiante): RevisionGestionable {
  return {
    id: revision.id,
    artefactoId: revision.artefacto,
    version: revision.version,
    estadoId: revision.estadoRevisionAsesor,
    estadoNombre: revision.estadoRevisionAsesorNombre,
    nombreProyecto: revision.nombreProyecto,
    nombreDocumento: revision.nombreDocumento,
    versionDocumento: revision.versionDocumento,
    fechaCreacion: revision.fechaCreacion,
  };
}

export function desVersion(version: VersionArtefacto): RevisionGestionable | null {
  if (
    version.revisionAsesor === null ||
    version.estadoRevision === null ||
    !estudianteVeObservaciones(version)
  ) {
    return null;
  }
  return {
    id: version.revisionAsesor,
    artefactoId: version.artefacto,
    version: version.version,
    estadoId: version.estadoRevision,
    estadoNombre: version.nombreEstadoRevision ?? version.estadoRevision,
    nombreProyecto: version.nombreProyecto,
    nombreDocumento: version.nombreDocumento,
    versionDocumento: version.versionDocumento,
    fechaCreacion: version.fechaCreacionRevision,
  };
}

export function haySubidaPosterior(
  version: number,
  ultima: VersionArtefacto | null | undefined,
): boolean | undefined {
  if (ultima === undefined) return undefined;
  return ultima !== null && ultima.version > version;
}
