import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { ConsultaCriteriaRequest } from '../../../shared/models/query-criteria';
import type { RepositorioArtefacto } from '../models/RepositorioArtefacto';

export const repositorioArtefactosService = {
  consultarRepositoriosAdministrador: (
    req: ConsultaCriteriaRequest,
  ): Promise<Page<RepositorioArtefacto>> =>
    apiClient
      .post<Page<RepositorioArtefacto>>('/repositorio-artefactos/administrador', req)
      .then((r) => r.data),
};
