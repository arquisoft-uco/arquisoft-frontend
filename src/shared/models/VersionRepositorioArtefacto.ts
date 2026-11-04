export interface VersionRepositorioArtefacto {
  id: string;
  nombreDocumento: string;
  numeroVersion: number;
  fechaCreacion: string;
  tipoContenido: string;
  tamanoBytes: number;
  nombreArchivo: string;
  hashSha256?: string;
}
