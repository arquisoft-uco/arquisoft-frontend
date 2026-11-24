import type { EntregableEvaluacion } from './Evaluacion';
import type { EstadoEvaluacion } from './EstadoEvaluacion';
import type { NotasEvaluador } from './NotasEvaluador';

export interface EvaluacionAsignadaAsesor {
  id: string;
  evaluacion: {
    id: string;
    estado: Pick<EstadoEvaluacion, 'id' | 'nombre'>;
  };
  entregable: EntregableEvaluacion;
  tieneEvaluacionesCualitativas: boolean;
  tieneEvaluacionesCuantitativas: boolean;
  notas: NotasEvaluador;
}
