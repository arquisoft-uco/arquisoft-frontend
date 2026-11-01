import type { VersionArtefacto } from '../models/VersionArtefacto';
import { ESTADO_REVISION_CERRADA, ESTADO_REVISION_PENDIENTE } from './revision-version';

const ESTADO_REVISION_EN_PROGRESO = 'EN_PROGRESO';
const ESTADO_REVISION_RESUELTA = 'RESUELTA';

const ESPERANDO_REVISION = 'Esperando la revisión del asesor.';

export function motivoBloqueoSubida(ultima: VersionArtefacto | null): string | null {
  if (ultima === null) return null;
  switch (ultima.estadoRevision) {
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
