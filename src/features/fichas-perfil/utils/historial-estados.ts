import type { HistorialEstadoFichaPerfil } from '../models/HistorialEstadoFichaPerfil';

function marcaDeTiempo(fecha: string): number {
  const marca = Date.parse(fecha);
  return Number.isNaN(marca) ? 0 : marca;
}

export function ordenarMasRecientePrimero(
  historial: HistorialEstadoFichaPerfil[],
): HistorialEstadoFichaPerfil[] {
  return [...historial].sort(
    (a, b) => marcaDeTiempo(b.fechaActualizacion) - marcaDeTiempo(a.fechaActualizacion),
  );
}
