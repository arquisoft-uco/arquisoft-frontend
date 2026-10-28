import type { EstadoEvaluacionJuradoId } from '../models/EstadoEvaluacionJurado';

export const ESTADO_JURADO_PENDIENTE: EstadoEvaluacionJuradoId = 'PENDIENTE_POR_EVALUAR';
export const ESTADO_JURADO_EVALUADA: EstadoEvaluacionJuradoId = 'EVALUADA';

export const OPCIONES_ESTADO_JURADO = [
  { id: ESTADO_JURADO_PENDIENTE, etiqueta: 'Pendientes por evaluar' },
  { id: ESTADO_JURADO_EVALUADA, etiqueta: 'Evaluadas' },
];
