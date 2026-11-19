export interface ArtefactoSinAvance {
  id: string;
  nombreDocumento: string;
  versionDocumento: number;
  nombreProyecto: string;
  diasSinAvance?: number;
  estadoUltimaRevision?: string;
}
