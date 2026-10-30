import {
  aceptaDe,
  tipoContenidoDe as tipoContenidoPorTabla,
} from '../../../shared/utils/tipo-archivo';

// Espejo de TipoArchivoPlantilla del backend: extensión → tipoContenido canónico.
export const TIPOS_ARCHIVO_VERSION: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

export const EXTENSIONES_VERSION = Object.keys(TIPOS_ARCHIVO_VERSION);

export const ACEPTA_VERSION = aceptaDe(TIPOS_ARCHIVO_VERSION);

export function tipoContenidoDe(archivo: File): string {
  return tipoContenidoPorTabla(archivo, TIPOS_ARCHIVO_VERSION);
}
