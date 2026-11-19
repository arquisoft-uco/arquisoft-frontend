import type { ParEvaluacionCuantitativaJurado } from './ParEvaluacionCuantitativaJurado';

export interface RegistrarEvaluacionesCuantitativasJuradoRequest {
  evaluacionJuradoId: string;
  evaluaciones: ParEvaluacionCuantitativaJurado[];
}
