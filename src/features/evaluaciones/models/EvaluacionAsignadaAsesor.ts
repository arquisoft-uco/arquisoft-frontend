import type { EntregableEvaluacion } from './Evaluacion';
import type { EstadoEvaluacion } from './EstadoEvaluacion';

export interface EvaluacionAsignadaAsesor {
  id: string;
  evaluacion: {
    id: string;
    estado: Pick<EstadoEvaluacion, 'id' | 'nombre'>;
  };
  entregable: EntregableEvaluacion;
  tieneEvaluacionesCualitativas: boolean;
  tieneEvaluacionesCuantitativas: boolean;
}
