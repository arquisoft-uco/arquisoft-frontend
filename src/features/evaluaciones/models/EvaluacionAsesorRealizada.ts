import type { Asesor } from '../../../shared/models/Asesor';
import type { Evaluacion } from './Evaluacion';

export interface EvaluacionAsesorRealizada {
  id: string;
  evaluacion: Evaluacion;
  asesor: Asesor;
}
