import { evaluacionesService } from '../services/evaluacionesService';
import { useListadoEvaluaciones } from './useListadoEvaluaciones';

export function useEvaluacionesAsignadasAsesor() {
  return useListadoEvaluaciones('asesor', evaluacionesService.getEvaluacionesAsignadasAsesor);
}
