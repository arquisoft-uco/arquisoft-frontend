export function tipoContenidoDe(archivo: File, tipos: Record<string, string>): string {
  const nombre = archivo.name.trim();
  const extension = nombre.slice(nombre.lastIndexOf('.') + 1).toLowerCase();
  return tipos[extension] ?? '';
}

export function aceptaDe(tipos: Record<string, string>): string {
  return Object.keys(tipos)
    .map((extension) => `.${extension}`)
    .join(',');
}
