import type { UseFormSetError } from 'react-hook-form';
import type { FaseSubida } from '../../../shared/models/FaseSubida';
import {
  getApiErrorMessage,
  getApiFieldErrors,
  hasApiErrorCode,
} from '../../../shared/utils/api-error';
import type { VersionArtefactoValues } from './version-artefacto-schema';

export const VERSION_ANTERIOR_SIN_REVISION = 'REVISION_ASESOR_VERSION_ANTERIOR_SIN_REVISION';
export const VERSION_ANTERIOR_NO_EN_PROGRESO = 'REVISION_ASESOR_VERSION_ANTERIOR_NO_EN_PROGRESO';
export const ARTEFACTO_CERRADO = 'ARTEFACTOS_ARTEFACTO_CERRADO';

const MENSAJES_BLOQUEO: [string, string][] = [
  [
    VERSION_ANTERIOR_SIN_REVISION,
    'Aún no puedes subir otra versión: el asesor debe revisar la versión actual.',
  ],
  [
    VERSION_ANTERIOR_NO_EN_PROGRESO,
    'Aún no puedes subir otra versión: el asesor debe enviarte primero su revisión.',
  ],
  [ARTEFACTO_CERRADO, 'El asesor cerró este artefacto: ya no admite nuevas versiones.'],
];

const CODIGOS_ARCHIVO = [
  'VERSION_ARTEFACTO_NOMBRE_ARCHIVO_DEMASIADO_LARGO',
  'VERSION_ARTEFACTO_NOMBRE_ARCHIVO_INVALIDO',
  'VERSION_ARTEFACTO_TIPO_CONTENIDO_DEMASIADO_LARGO',
  'VERSION_ARTEFACTO_TIPO_CONTENIDO_NO_COINCIDE_EXTENSION',
  'VERSION_ARTEFACTO_TIPO_NO_PERMITIDO',
  'VERSION_ARTEFACTO_TAMANO_BYTES_INVALIDO',
  'VERSION_ARTEFACTO_TAMANO_ARCHIVO_EXCEDIDO',
  'VERSION_ARTEFACTO_TIPO_ARCHIVO_NO_COINCIDE',
];

const CAMPOS_ARCHIVO = ['nombreArchivo', 'tipoContenido', 'tamanoBytes'];

const RESPALDO_POR_FASE: Record<FaseSubida, string> = {
  solicitando: 'No se pudo preparar la carga. Vuelve a intentarlo.',
  subiendo: 'El almacenamiento no aceptó el archivo. Vuelve a intentarlo.',
  registrando: 'No se pudo registrar la versión. Vuelve a intentarlo.',
};

export function mensajeDeErrorDeVersionArtefacto(err: unknown, fase: FaseSubida | null): string {
  const bloqueo = MENSAJES_BLOQUEO.find(([codigo]) => hasApiErrorCode(err, codigo));
  if (bloqueo) return bloqueo[1];
  return getApiErrorMessage(err, RESPALDO_POR_FASE[fase ?? 'solicitando']);
}

export function esBloqueoDeSubida(err: unknown): boolean {
  return MENSAJES_BLOQUEO.some(([codigo]) => hasApiErrorCode(err, codigo));
}

export function esErrorDeArchivo(err: unknown): boolean {
  return (
    CODIGOS_ARCHIVO.some((codigo) => hasApiErrorCode(err, codigo)) ||
    getApiFieldErrors(err).some(({ field }) => CAMPOS_ARCHIVO.includes(field))
  );
}

// Devuelve el mensaje de negocio para el Notice, o null cuando el error quedó junto al campo Archivo.
export function aplicarErrorDeVersionArtefacto(
  err: unknown,
  fase: FaseSubida | null,
  setError: UseFormSetError<VersionArtefactoValues>,
): string | null {
  const mensajeGeneral = mensajeDeErrorDeVersionArtefacto(err, fase);
  if (!esErrorDeArchivo(err)) return mensajeGeneral;
  const delCampo = getApiFieldErrors(err).find(({ field }) => CAMPOS_ARCHIVO.includes(field));
  setError('archivo', { message: delCampo?.message ?? mensajeGeneral });
  return null;
}
