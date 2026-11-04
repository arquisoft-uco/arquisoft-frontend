import { evaluacionesService } from '../services/evaluacionesService';
import { useListadoEvaluaciones } from './useListadoEvaluaciones';

export function useEvaluacionesEstudiante() {
  return useListadoEvaluaciones('estudiante', evaluacionesService.getEvaluacionesEstudiante);
}
