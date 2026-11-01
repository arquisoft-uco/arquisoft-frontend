import type { VersionArtefacto } from '../models/VersionArtefacto';
import { textoSituacionReapertura } from './decision-observacion';
import type { SituacionReapertura } from './decision-observacion';
import { ESTADO_REVISION_RESUELTA, estadoPermiteGestionarObservaciones } from './revision-version';

const AVISO_NO_PENDIENTE =
  'Esta revisión ya no está pendiente: sus observaciones no se pueden cambiar.';
const AVISO_OMITIDO = 'Este artefacto está omitido y no admite cambios.';

interface Entrada {
  editable: boolean;
  version: VersionArtefacto;
  omitido: boolean;
  puedeDecidir: boolean;
  haySolucionadas: boolean;
  situacion: SituacionReapertura;
}

export function textoAvisoObservaciones({
  editable,
  version,
  omitido,
  puedeDecidir,
  haySolucionadas,
  situacion,
}: Entrada): string | null {
  if (editable) return null;
  if (puedeDecidir) return haySolucionadas ? textoSituacionReapertura(situacion, version) : null;
  if (version.estadoRevision === ESTADO_REVISION_RESUELTA && omitido) return AVISO_OMITIDO;
  if (!estadoPermiteGestionarObservaciones(version)) return AVISO_NO_PENDIENTE;
  return omitido ? AVISO_OMITIDO : null;
}
