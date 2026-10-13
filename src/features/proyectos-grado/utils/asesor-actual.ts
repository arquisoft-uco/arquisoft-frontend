import type { AsesorProyectoGrado } from '../models/AsesorProyectoGrado';
import { ESTADO_ASESOR_ASIGNADO, hayAsesorAsignado } from './cupo-asesor';

export function marcarAsesorActual(asesores: AsesorProyectoGrado[]): AsesorProyectoGrado[] {
  // Se combina con el `actual` del backend para descartar filas ASIGNADO históricas de un asesor con una fila posterior
  const indiceActual = asesores.findIndex(
    (asesor) => asesor.estado.id === ESTADO_ASESOR_ASIGNADO && asesor.actual,
  );

  return asesores.map((asesor, indice) => ({ ...asesor, actual: indice === indiceActual }));
}

export function ultimoRegistroSinAsesor(
  asesores: AsesorProyectoGrado[],
): AsesorProyectoGrado | null {
  // El backend ordena por fecha descendente: la primera fila es el último registro
  return asesores.length > 0 && !hayAsesorAsignado(asesores) ? asesores[0] : null;
}
