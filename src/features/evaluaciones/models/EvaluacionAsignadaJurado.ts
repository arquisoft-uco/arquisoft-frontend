import type { EntregableEvaluacion } from './Evaluacion';
import type { EstadoEvaluacion } from './EstadoEvaluacion';
import type { EstadoEvaluacionJurado } from './EstadoEvaluacionJurado';

export interface EvaluacionAsignadaJurado {
  id: string;
  estado: EstadoEvaluacionJurado;
  evaluacion: {
    id: string;
    estado: Pick<EstadoEvaluacion, 'id' | 'nombre'>;
  };
  entregable: EntregableEvaluacion;
  tieneEvaluacionesCualitativas: boolean;
  tieneEvaluacionesCuantitativas: boolean;
}
