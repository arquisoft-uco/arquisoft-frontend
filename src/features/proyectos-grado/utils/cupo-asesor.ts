import type { OpcionCombobox } from '../../../shared/components/ui/Combobox';
import type { Asesor } from '../../../shared/models/Asesor';
import type { AsesorProyectoGrado } from '../models/AsesorProyectoGrado';

export const ESTADO_ASESOR_ASIGNADO = 'ASIGNADO';

// El backend solo limita las filas ASIGNADO vigentes (la última de su asesor); el historial no cuenta.
export function hayAsesorAsignado(asesores: AsesorProyectoGrado[]): boolean {
  return asesores.some((a) => a.estado.id === ESTADO_ASESOR_ASIGNADO && a.actual);
}

export function opcionesAsesor(vigentes: Asesor[]): OpcionCombobox[] {
  return vigentes.map((a) => ({ id: a.id, etiqueta: a.nombre, descripcion: a.email }));
}
