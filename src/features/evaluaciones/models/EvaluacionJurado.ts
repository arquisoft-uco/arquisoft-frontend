export interface JuradoDeEvaluacion {
  id: string;
  nombre: string;
  email: string;
}

export interface EvaluacionJurado {
  id: string;
  jurado: JuradoDeEvaluacion;
}
