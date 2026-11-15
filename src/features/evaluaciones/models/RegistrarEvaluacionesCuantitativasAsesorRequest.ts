import type { ParEvaluacionCuantitativaAsesor } from './ParEvaluacionCuantitativaAsesor';

export interface RegistrarEvaluacionesCuantitativasAsesorRequest {
  evaluacionAsesorId: string;
  evaluaciones: ParEvaluacionCuantitativaAsesor[];
}
