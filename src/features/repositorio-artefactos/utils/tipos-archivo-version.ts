// Espejo de TipoArchivoPlantilla del backend: extensión → tipoContenido canónico.
export const TIPOS_ARCHIVO_VERSION: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

export const EXTENSIONES_VERSION = Object.keys(TIPOS_ARCHIVO_VERSION);

export const ACEPTA_VERSION = EXTENSIONES_VERSION.map((e) => `.${e}`).join(',');

export function tipoContenidoDe(archivo: File): string {
  const nombre = archivo.name.trim();
  const extension = nombre.slice(nombre.lastIndexOf('.') + 1).toLowerCase();
  return TIPOS_ARCHIVO_VERSION[extension] ?? '';
}
