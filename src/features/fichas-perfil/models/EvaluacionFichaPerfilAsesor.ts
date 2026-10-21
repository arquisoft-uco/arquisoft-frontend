export type OrdenCampoEvaluacionAsesor = 'tituloProyecto' | 'fechaCreacion';

export interface EvaluacionFichaPerfilAsesor {
  id: string;
  fichaPerfilId: string;
  tituloProyecto: string;
  fechaCreacion: string;
  estadoEvaluacionId: string | null;
  estadoEvaluacionNombre: string | null;
  representante: { id: string; nombre: string };
}
