export interface VersionArtefacto {
  id: string;
  artefacto: string;
  version: number;
  fechaCreacion: string;
  uriArchivo?: string;
  nombreProyecto: string;
  nombreDocumento: string;
  versionDocumento: number;
  nombreRepositorio: string;
  nombreAsesor: string;
  revisionAsesor: string | null;
  estadoRevision: string | null;
  nombreEstadoRevision: string | null;
}
