import type { HistorialEstadoEntregable } from '../models/HistorialEstadoEntregable';

function marcaDeTiempo(fecha: string): number {
  const marca = Date.parse(fecha);
  return Number.isNaN(marca) ? 0 : marca;
}

export function ordenarMasRecientePrimero(
  historial: HistorialEstadoEntregable[],
): HistorialEstadoEntregable[] {
  return [...historial].sort(
    (a, b) => marcaDeTiempo(b.fechaActualizacion) - marcaDeTiempo(a.fechaActualizacion),
  );
}
