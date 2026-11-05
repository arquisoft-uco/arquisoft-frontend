import type { AsesorProyecto } from '../models/AsesorProyecto';
import type { Tarea } from '../models/Tarea';

export const ESTADO_ASESOR_ASIGNADO = 'ASIGNADO';

export function opcionesAsesorTarea(
  asesorActual: Tarea['asesor'],
  asesores: AsesorProyecto[],
): AsesorProyecto[] {
  const asignados = asesores.filter((a) => a.estadoId === ESTADO_ASESOR_ASIGNADO && a.actual);
  if (asignados.some((a) => a.id === asesorActual.id)) return asignados;
  return [
    ...asignados,
    {
      id: asesorActual.id,
      nombre: asesorActual.nombre,
      email: asesorActual.email,
      estadoId: ESTADO_ASESOR_ASIGNADO,
      actual: true,
    },
  ];
}
