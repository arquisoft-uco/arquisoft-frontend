const FORMATO = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' });

export function formatearFecha(iso: string): string {
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? '—' : FORMATO.format(fecha);
}
