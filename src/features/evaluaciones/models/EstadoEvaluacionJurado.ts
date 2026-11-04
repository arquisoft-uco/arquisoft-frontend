export type EstadoEvaluacionJuradoId = 'PENDIENTE_POR_EVALUAR' | 'EVALUADA';

export interface EstadoEvaluacionJurado {
  id: EstadoEvaluacionJuradoId;
  nombre: string;
}
