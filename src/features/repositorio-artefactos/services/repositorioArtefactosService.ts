import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { ConsultaCriteriaRequest } from '../../../shared/models/query-criteria';
import type { GenerarRepositorioArtefactoRequest } from '../models/GenerarRepositorioArtefactoRequest';
import type { GenerarRepositorioArtefactoResponse } from '../models/GenerarRepositorioArtefactoResponse';
import type { ModificarRepositorioArtefactoRequest } from '../models/ModificarRepositorioArtefactoRequest';
import type { RepositorioArtefacto } from '../models/RepositorioArtefacto';
import type { VersionRepositorioArtefacto } from '../../../shared/models/VersionRepositorioArtefacto';

export const repositorioArtefactosService = {
  consultarRepositoriosAdministrador: (
    req: ConsultaCriteriaRequest,
  ): Promise<Page<RepositorioArtefacto>> =>
    apiClient
      .post<Page<RepositorioArtefacto>>('/repositorio-artefactos/administrador', req)
      .then((r) => r.data),

  consultarVersionesRepositorio: (repositorioId: string): Promise<VersionRepositorioArtefacto[]> =>
    apiClient
      .get<VersionRepositorioArtefacto[]>(`/repositorio-artefactos/${repositorioId}/versiones`)
      .then((r) => r.data),

  generarRepositorio: (
    req: GenerarRepositorioArtefactoRequest,
  ): Promise<GenerarRepositorioArtefactoResponse> =>
    apiClient
      .post<GenerarRepositorioArtefactoResponse>('/repositorio-artefactos', req)
      .then((r) => r.data),

  modificarRepositorio: (
    repositorioId: string,
    req: ModificarRepositorioArtefactoRequest,
  ): Promise<void> =>
    apiClient.patch<void>(`/repositorio-artefactos/${repositorioId}`, req).then(() => undefined),
};
