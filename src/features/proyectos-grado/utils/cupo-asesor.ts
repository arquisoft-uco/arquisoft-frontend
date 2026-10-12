import type { OpcionCombobox } from '../../../shared/components/ui/Combobox';
import type { Asesor } from '../../../shared/models/Asesor';
import type { AsesorProyectoGrado } from '../models/AsesorProyectoGrado';

export const ESTADO_ASESOR_ASIGNADO = 'ASIGNADO';

// A diferencia del cupo de estudiantes, las filas FINALIZADO no cuentan: el backend solo limita los ASIGNADO.
export function hayAsesorAsignado(asesores: AsesorProyectoGrado[]): boolean {
  return asesores.some((a) => a.estado.id === ESTADO_ASESOR_ASIGNADO);
}

export function opcionesAsesor(vigentes: Asesor[]): OpcionCombobox[] {
  return vigentes.map((a) => ({ id: a.id, etiqueta: a.nombre, descripcion: a.email }));
}
