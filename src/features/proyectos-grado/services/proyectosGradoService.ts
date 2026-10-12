import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { ConsultaCriteriaRequest } from '../../../shared/models/query-criteria';
import type { ProyectoGrado } from '../models/ProyectoGrado';

export const proyectosGradoService = {
  getProyectosCoordinador(req: ConsultaCriteriaRequest): Promise<Page<ProyectoGrado>> {
    return apiClient
      .post<Page<ProyectoGrado>>('/proyectos-grado/coordinador', req)
      .then((r) => r.data);
  },
};
