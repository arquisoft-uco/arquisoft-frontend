export interface ResumenEvaluacion {
  id: string;
  proyecto: string;
  version: number;
  finalizada?: boolean;
}

export interface NavegacionJuradosEvaluacion {
  resumen: ResumenEvaluacion;
  search: string;
}
