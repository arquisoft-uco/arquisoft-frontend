export interface RevisionAsesorEstudiante {
  id: string;
  versionArtefacto: string;
  artefacto: string;
  version: number;
  estadoRevisionAsesor: string;
  estadoRevisionAsesorNombre: string;
  fechaCreacion: string;
  nombreProyecto: string;
  nombreDocumento: string;
  versionDocumento: number;
  observacionesAbiertas: number;
  totalObservaciones: number;
}
