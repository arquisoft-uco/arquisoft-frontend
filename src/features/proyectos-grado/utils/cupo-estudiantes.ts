import type { OpcionCombobox } from '../../../shared/components/ui/Combobox';
import type { EstudianteVigente } from '../../../shared/models/EstudianteVigente';
import { LIMITES } from '../../../shared/validation';
import type { EstudianteProyectoGrado } from '../models/EstudianteProyectoGrado';

// El backend cuenta también a los estudiantes dados de baja, así que aquí tampoco se descuentan.
export function cupoDisponible(vinculados: EstudianteProyectoGrado[]): number {
  return Math.max(0, LIMITES.ESTUDIANTES_MAX - vinculados.length);
}

export function candidatosAsignables(
  vigentes: EstudianteVigente[],
  vinculados: EstudianteProyectoGrado[],
): OpcionCombobox[] {
  const idsVinculados = new Set(vinculados.map((v) => v.estudianteId));
  return vigentes
    .filter((e) => !idsVinculados.has(e.id))
    .map((e) => ({ id: e.id, etiqueta: e.nombre, descripcion: e.email }));
}
