import type { EstadoEvaluacionJuradoId } from '../models/EstadoEvaluacionJurado';
import type { EvaluacionAsignadaJurado } from '../models/EvaluacionAsignadaJurado';

export const ESTADO_JURADO_PENDIENTE: EstadoEvaluacionJuradoId = 'PENDIENTE_POR_EVALUAR';
export const ESTADO_JURADO_EVALUADA: EstadoEvaluacionJuradoId = 'EVALUADA';

export const OPCIONES_ESTADO_JURADO = [
  { id: ESTADO_JURADO_PENDIENTE, etiqueta: 'Pendientes por evaluar' },
  { id: ESTADO_JURADO_EVALUADA, etiqueta: 'Evaluadas' },
];

export function textoEvaluacionFaltante(
  asignacion: Pick<
    EvaluacionAsignadaJurado,
    'estado' | 'tieneEvaluacionesCualitativas' | 'tieneEvaluacionesCuantitativas'
  >,
): string | null {
  if (asignacion.estado.id !== ESTADO_JURADO_PENDIENTE) return null;
  const { tieneEvaluacionesCualitativas: cual, tieneEvaluacionesCuantitativas: cuant } = asignacion;
  if (!cual && !cuant) return 'Faltan ambas';
  if (!cual) return 'Falta la cualitativa';
  if (!cuant) return 'Falta la cuantitativa';
  return null;
}
