export interface ArtefactoSinAvance {
  id: string;
  proyectoGrado: string;
  nombreProyecto: string;
  versionRepositorioArtefacto: string;
  nombreDocumento: string;
  versionDocumento: number;
  nombreRepositorio: string;
  fechaUltimaVersion?: string;
  diasSinAvance?: number;
  estadoUltimaRevision?: string;
  proyectoFinalizado: boolean;
  proyectoCancelado: boolean;
}
