import type { UseFormSetError } from 'react-hook-form';
import type { FaseSubida } from '../../../shared/models/FaseSubida';
import {
  getApiErrorMessage,
  getApiFieldErrors,
  hasApiErrorCode,
} from '../../../shared/utils/api-error';
import type { VersionArtefactoValues } from './version-artefacto-schema';

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
  return getApiErrorMessage(err, RESPALDO_POR_FASE[fase ?? 'solicitando']);
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
