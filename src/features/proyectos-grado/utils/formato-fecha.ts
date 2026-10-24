const FORMATO_FECHA = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' });

export function formatearFecha(iso: string): string {
  return FORMATO_FECHA.format(new Date(iso));
}
