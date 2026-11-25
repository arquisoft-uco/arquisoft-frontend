import type { Asesor } from '../../../shared/models/Asesor';
import type { NotasEvaluador } from './NotasEvaluador';

export interface EvaluacionAsesor {
  id: string;
  asesor: Asesor;
  notas: NotasEvaluador;
}
