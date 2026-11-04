import type { VersionRepositorioArtefacto } from '../../../shared/models/VersionRepositorioArtefacto';

export interface RepositorioDeVersion {
  id: string;
  nombreRepositorio: string;
  descripcion: string;
}

export interface VersionRepositorioAsesor extends VersionRepositorioArtefacto {
  repositorioArtefacto: RepositorioDeVersion;
}
