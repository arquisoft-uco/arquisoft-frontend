export interface PlanEstimadoProyectoResponse {
  id: string;
  tarea: string;
  descripcionTarea: string;
  mapaRuta: string;
  tiempoEstimadoDias: number;
  descripcionEstimado: string | null;
}
