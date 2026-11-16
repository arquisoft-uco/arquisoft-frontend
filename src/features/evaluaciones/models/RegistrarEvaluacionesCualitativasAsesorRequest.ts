import type { ParEvaluacionCualitativaAsesor } from './ParEvaluacionCualitativaAsesor';

export interface RegistrarEvaluacionesCualitativasAsesorRequest {
  evaluacionAsesorId: string;
  evaluaciones: ParEvaluacionCualitativaAsesor[];
}
