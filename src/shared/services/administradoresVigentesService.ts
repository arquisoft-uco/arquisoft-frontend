import apiClient from '../../api/axiosInstance';
import type { AdministradorVigente } from '../models/AdministradorVigente';
import type { Page } from '../models/api-response';
import type { ConsultaCriteriaRequest } from '../models/query-criteria';

export const administradoresVigentesService = {
  consultarAdministradoresVigentes: (
    req?: ConsultaCriteriaRequest,
  ): Promise<Page<AdministradorVigente>> =>
    apiClient
      .post<Page<AdministradorVigente>>('/usuarios/administradores/vigentes', req)
      .then((r) => r.data),
};
