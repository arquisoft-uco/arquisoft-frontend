import type { ResumenEvaluacion } from './ResumenEvaluacion';

export interface NavegacionEvaluacionJurado {
  evaluacionJuradoId: string;
  evaluacionId: string;
  jurado: string;
  resumen: ResumenEvaluacion;
  search: string;
  searchJurados: string;
}
