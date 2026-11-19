export interface PlanEstimadoProyecto {
  id: string;
  tareaId: string;
  descripcionTarea: string;
  mapaRutaId: string;
  tiempoEstimadoDias: number;
  descripcionEstimado: string | null;
}
