import type { AsesorProyectoGrado } from '../models/AsesorProyectoGrado';

const ESTADO_ASESOR_ASIGNADO = 'ASIGNADO';

export function marcarAsesorActual(asesores: AsesorProyectoGrado[]): AsesorProyectoGrado[] {
  // Se combina con el `actual` del backend para descartar filas ASIGNADO históricas de un asesor con una fila posterior
  const indiceActual = asesores.findIndex(
    (asesor) => asesor.estado.id === ESTADO_ASESOR_ASIGNADO && asesor.actual,
  );

  return asesores.map((asesor, indice) => ({ ...asesor, actual: indice === indiceActual }));
}
