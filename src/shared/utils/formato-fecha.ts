export function formatearFechaCorta(fecha: string): string {
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
}

export function textoRangoFechas(desde: string, hasta: string): string {
  if (desde && hasta) return `${formatearFechaCorta(desde)} – ${formatearFechaCorta(hasta)}`;
  if (desde) return `Desde ${formatearFechaCorta(desde)}`;
  if (hasta) return `Hasta ${formatearFechaCorta(hasta)}`;
  return '';
}
