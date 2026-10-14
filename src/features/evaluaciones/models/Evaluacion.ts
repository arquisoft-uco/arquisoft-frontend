import type { EstadoEvaluacion } from './EstadoEvaluacion';

export interface EntregableEvaluacion {
  id: string;
  proyecto: string;
  version: number;
}

export interface Evaluacion {
  id: string;
  entregable: EntregableEvaluacion;
  estado: Pick<EstadoEvaluacion, 'id' | 'nombre'>;
}
