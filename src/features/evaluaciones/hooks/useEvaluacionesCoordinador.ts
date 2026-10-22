import { evaluacionesService } from '../services/evaluacionesService';
import { useListadoEvaluaciones } from './useListadoEvaluaciones';

export function useEvaluacionesCoordinador() {
  return useListadoEvaluaciones('coordinador', evaluacionesService.getEvaluacionesCoordinador);
}
