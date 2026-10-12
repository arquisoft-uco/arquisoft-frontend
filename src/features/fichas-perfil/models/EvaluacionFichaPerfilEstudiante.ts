export interface EvaluacionFichaPerfilEstudiante {
  id: string;
  fichaPerfilId: string;
  fechaCreacion: string;
  estadoEvaluacionId: string | null;
  estadoEvaluacionNombre: string | null;
  representante: { id: string; nombre: string };
}
