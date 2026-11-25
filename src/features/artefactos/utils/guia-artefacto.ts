import type { EstadoRevisionAsesor } from '../models/artefactos';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import {
  motivoBloqueoPorEstado,
  motivoBloqueoSubida,
  resolverPorEstadoDeParticipacion,
} from './bloqueo-subida-version';
import { ESTADO_REVISION_EN_PROGRESO, ESTADO_REVISION_RESUELTA } from './revision-resoluble';
import { ESTADO_REVISION_CERRADA, ESTADO_REVISION_PENDIENTE } from './revision-version';

const ESTUDIANTE_SIN_VERSION = 'Aún no has subido ninguna versión del artefacto.';
const ESTUDIANTE_EN_PROGRESO = 'Atiende las observaciones del asesor y sube una nueva versión.';

const ASESOR_SIN_VERSION = 'Esperando que el estudiante suba la primera versión.';
const ASESOR_SIN_REVISION = 'Hay una versión sin revisar: regístrale la revisión.';
const ASESOR_PENDIENTE = 'Revisión en borrador: agrega las observaciones y envíala.';
const ASESOR_EN_PROGRESO = 'El estudiante está atendiendo tus observaciones.';
const ASESOR_RESUELTA =
  'El estudiante resolvió las observaciones: revísalas y decide si las cierras o las reabres.';
const ASESOR_CERRADA = 'Cerraste este artefacto: ya no admite nuevas versiones.';

export function guiaArtefactoEstudiante(ultima: VersionArtefacto | null): string | null {
  if (ultima === null) return ESTUDIANTE_SIN_VERSION;
  if (ultima.estadoRevision === ESTADO_REVISION_EN_PROGRESO) return ESTUDIANTE_EN_PROGRESO;
  return motivoBloqueoSubida(ultima);
}

export function guiaParticipacionEstudiante(
  estadoUltimaRevision: string | undefined,
  estados: EstadoRevisionAsesor[] | undefined,
): string | null | undefined {
  return resolverPorEstadoDeParticipacion(estadoUltimaRevision, estados, (id) =>
    id === ESTADO_REVISION_EN_PROGRESO ? ESTUDIANTE_EN_PROGRESO : motivoBloqueoPorEstado(id),
  );
}

export function guiaArtefactoAsesor(ultima: VersionArtefacto | null): string {
  if (ultima === null) return ASESOR_SIN_VERSION;
  switch (ultima.estadoRevision) {
    case ESTADO_REVISION_PENDIENTE:
      return ASESOR_PENDIENTE;
    case ESTADO_REVISION_EN_PROGRESO:
      return ASESOR_EN_PROGRESO;
    case ESTADO_REVISION_RESUELTA:
      return ASESOR_RESUELTA;
    case ESTADO_REVISION_CERRADA:
      return ASESOR_CERRADA;
    default:
      return ASESOR_SIN_REVISION;
  }
}
