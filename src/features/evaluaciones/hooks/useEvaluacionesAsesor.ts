import { evaluacionesService } from '../services/evaluacionesService';
import { useListadoEvaluaciones } from './useListadoEvaluaciones';

export function useEvaluacionesAsesor() {
  return useListadoEvaluaciones('asesor', evaluacionesService.getEvaluacionesAsesor);
}
