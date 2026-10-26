const FORMATO_FECHA = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

const UNIDADES = ['B', 'KB', 'MB', 'GB'];

export function formatearFechaCreacion(iso: string): string {
  return FORMATO_FECHA.format(new Date(iso));
}

export function formatearTamano(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  let valor = bytes;
  let indice = 0;
  while (valor >= 1024 && indice < UNIDADES.length - 1) {
    valor /= 1024;
    indice += 1;
  }
  return `${valor.toFixed(1)} ${UNIDADES[indice]}`;
}
