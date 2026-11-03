export interface RevisionGestionable {
  id: string;
  artefactoId: string;
  version: number;
  estadoId: string;
  estadoNombre: string;
  nombreProyecto: string;
  nombreDocumento: string;
  versionDocumento: number;
  fechaCreacion: string | null;
}
