import { esFechaIsoReal } from '../../../shared/validation';

const SIN_FECHA = '—';

const formateador = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' });

export function formatearFechaCivil(iso: string): string {
  if (!esFechaIsoReal(iso)) return SIN_FECHA;
  const [anio, mes, dia] = iso.split('-').map(Number);
  return formateador.format(new Date(anio, mes - 1, dia));
}
