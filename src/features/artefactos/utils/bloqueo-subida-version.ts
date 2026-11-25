import type { EstadoRevisionAsesor } from '../models/artefactos';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { idEstadoUltimaRevision } from './estado-ultima-revision';
import { ESTADO_REVISION_CERRADA, ESTADO_REVISION_PENDIENTE } from './revision-version';

const ESTADO_REVISION_EN_PROGRESO = 'EN_PROGRESO';
const ESTADO_REVISION_RESUELTA = 'RESUELTA';

const ESPERANDO_REVISION = 'Esperando la revisión del asesor.';

export function motivoBloqueoPorEstado(estadoRevisionId: string | null): string | null {
  switch (estadoRevisionId) {
    case ESTADO_REVISION_EN_PROGRESO:
      return null;
    case ESTADO_REVISION_PENDIENTE:
      return 'El asesor está preparando la revisión.';
    case ESTADO_REVISION_RESUELTA:
      return 'Esperando la siguiente revisión del asesor.';
    case ESTADO_REVISION_CERRADA:
      return 'El asesor cerró este artefacto.';
    default:
      return ESPERANDO_REVISION;
  }
}

export function motivoBloqueoSubida(ultima: VersionArtefacto | null): string | null {
  if (ultima === null) return null;
  return motivoBloqueoPorEstado(ultima.estadoRevision);
}

export function resolverPorEstadoDeParticipacion(
  estadoUltimaRevision: string | undefined,
  estados: EstadoRevisionAsesor[] | undefined,
  resolver: (estadoRevisionId: string) => string | null,
): string | null | undefined {
  if (estadoUltimaRevision === undefined) return null;
  if (estados === undefined) return undefined;
  return resolver(idEstadoUltimaRevision(estados, estadoUltimaRevision) ?? estadoUltimaRevision);
}

export function motivoBloqueoSubidaDeParticipacion(
  estadoUltimaRevision: string | undefined,
  estados: EstadoRevisionAsesor[] | undefined,
): string | null | undefined {
  return resolverPorEstadoDeParticipacion(estadoUltimaRevision, estados, motivoBloqueoPorEstado);
}
