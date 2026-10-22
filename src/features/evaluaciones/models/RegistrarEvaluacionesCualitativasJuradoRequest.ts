import type { ParEvaluacionCualitativaJurado } from './ParEvaluacionCualitativaJurado';

export interface RegistrarEvaluacionesCualitativasJuradoRequest {
  evaluacionJuradoId: string;
  evaluaciones: ParEvaluacionCualitativaJurado[];
}
