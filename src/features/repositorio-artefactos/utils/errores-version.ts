import type { UseFormSetError } from 'react-hook-form';
import {
  getApiErrorMessage,
  getApiFieldErrors,
  hasApiErrorCode,
} from '../../../shared/utils/api-error';
import type { FaseSubidaVersion } from '../models/DatosSubidaVersion';
import type { VersionValues } from './version-schema';

const CODIGOS_DOCUMENTO = ['DOCUMENTO_YA_EXISTE', 'DOCUMENTO_NO_EXISTE'];

const CODIGOS_ARCHIVO = [
  'VERSION_REPOSITORIO_ARTEFACTO_NOMBRE_ARCHIVO_DEMASIADO_LARGO',
  'VERSION_REPOSITORIO_ARTEFACTO_NOMBRE_ARCHIVO_INVALIDO',
  'VERSION_REPOSITORIO_ARTEFACTO_TIPO_CONTENIDO_DEMASIADO_LARGO',
  'VERSION_REPOSITORIO_ARTEFACTO_TAMANO_BYTES_INVALIDO',
  'VERSION_REPOSITORIO_ARTEFACTO_TIPO_NO_PERMITIDO',
  'VERSION_REPOSITORIO_ARTEFACTO_TIPO_CONTENIDO_NO_COINCIDE_EXTENSION',
  'TAMANO_ARCHIVO_EXCEDIDO',
  'TIPO_ARCHIVO_NO_COINCIDE',
];

const MENSAJE_DOCUMENTO_YA_EXISTE = 'Ya existe un documento con este nombre en el repositorio.';
const MENSAJE_DOCUMENTO_NO_EXISTE = 'Este documento ya no existe en el repositorio.';

const RESPALDO_POR_FASE: Record<FaseSubidaVersion, string> = {
  solicitando: 'No se pudo preparar la carga. Vuelve a intentarlo.',
  subiendo: 'El almacenamiento no aceptó el archivo. Vuelve a intentarlo.',
  registrando: 'No se pudo registrar la versión. Vuelve a intentarlo.',
};

export function esErrorDeDocumento(err: unknown): boolean {
  return CODIGOS_DOCUMENTO.some((codigo) => hasApiErrorCode(err, codigo));
}

export function mensajeDeErrorDeVersion(err: unknown, fase: FaseSubidaVersion | null): string {
  return getApiErrorMessage(err, RESPALDO_POR_FASE[fase ?? 'solicitando']);
}

export function aplicarErrorDeVersion(err: unknown, setError: UseFormSetError<VersionValues>) {
  if (hasApiErrorCode(err, 'DOCUMENTO_YA_EXISTE')) {
    setError('nombreDocumento', { message: MENSAJE_DOCUMENTO_YA_EXISTE }, { shouldFocus: true });
  }
  if (hasApiErrorCode(err, 'DOCUMENTO_NO_EXISTE')) {
    setError('nombreDocumento', { message: MENSAJE_DOCUMENTO_NO_EXISTE }, { shouldFocus: true });
  }
  if (CODIGOS_ARCHIVO.some((codigo) => hasApiErrorCode(err, codigo))) {
    setError('archivo', { message: getApiErrorMessage(err, RESPALDO_POR_FASE.solicitando) });
  }
  for (const { field, message } of getApiFieldErrors(err)) {
    if (field === 'nombreArchivo' || field === 'tipoContenido' || field === 'tamanoBytes') {
      setError('archivo', { message });
    } else if (field === 'nombreDocumento') {
      setError('nombreDocumento', { message });
    }
  }
}
