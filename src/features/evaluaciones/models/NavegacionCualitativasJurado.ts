import type { ResumenEvaluacion } from './ResumenEvaluacion';

export interface NavegacionCualitativasJurado {
  evaluacionJuradoId: string;
  evaluacionId: string;
  jurado: string;
  resumen: ResumenEvaluacion | null;
  search: string;
  searchJurados: string;
}
