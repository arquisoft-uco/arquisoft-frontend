import { aceptaDe, tipoContenidoDe } from '../../../shared/utils/tipo-archivo';

// Espejo de TipoArchivoVersionArtefacto del backend: extensión → tipoContenido canónico.
export const TIPOS_ARCHIVO_VERSION_ARTEFACTO: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  md: 'text/markdown',
  txt: 'text/plain',
  drawio: 'application/vnd.jgraph.mxfile',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
};

export const EXTENSIONES_VERSION_ARTEFACTO = Object.keys(TIPOS_ARCHIVO_VERSION_ARTEFACTO);

export const ACEPTA_VERSION_ARTEFACTO = aceptaDe(TIPOS_ARCHIVO_VERSION_ARTEFACTO);

export function tipoContenidoDeArtefacto(archivo: File): string {
  return tipoContenidoDe(archivo, TIPOS_ARCHIVO_VERSION_ARTEFACTO);
}
