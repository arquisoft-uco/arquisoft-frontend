import type { AdministradorRepositorio } from './AdministradorRepositorio';

export interface RepositorioArtefacto {
  id: string;
  nombreRepositorio: string;
  descripcion?: string;
  administrador?: AdministradorRepositorio;
}
