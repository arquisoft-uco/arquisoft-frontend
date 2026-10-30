export interface ResumenEvaluacion {
  id: string;
  proyecto: string;
  version: number;
}

export interface NavegacionJuradosEvaluacion {
  resumen: ResumenEvaluacion;
  search: string;
}
