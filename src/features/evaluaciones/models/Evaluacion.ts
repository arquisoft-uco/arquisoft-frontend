import type { EstadoEvaluacion } from './EstadoEvaluacion';
import type { NotasEvaluacion } from './NotasEvaluacion';
import type { ResultadoEvaluacion } from './ResultadoEvaluacion';

export interface EntregableEvaluacion {
  id: string;
  proyecto: string;
  version: number;
}

export interface Evaluacion {
  id: string;
  entregable: EntregableEvaluacion;
  estado: Pick<EstadoEvaluacion, 'id' | 'nombre'>;
  notas: NotasEvaluacion;
  resultado: ResultadoEvaluacion | null;
}
