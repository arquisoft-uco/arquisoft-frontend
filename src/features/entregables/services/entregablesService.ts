import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { ConsultaCriteriaRequest } from '../../../shared/models/query-criteria';
import type { EntregableProyectoGrado } from '../models/EntregableProyectoGrado';
import type { EstadoEntregable } from '../models/entregables';

export const entregablesService = {
  getEstadosEntregable: (): Promise<EstadoEntregable[]> =>
    apiClient.get<EstadoEntregable[]>('/estados-entregable').then((r) => r.data),

  consultarEntregablesAsesor: (
    req: ConsultaCriteriaRequest,
  ): Promise<Page<EntregableProyectoGrado>> =>
    apiClient
      .post<Page<EntregableProyectoGrado>>('/entregables-proyecto-grado/asesor', req)
      .then((r) => r.data),

  consultarEntregablesEstudiante: (
    proyectoGradoId: string,
    req: ConsultaCriteriaRequest,
  ): Promise<Page<EntregableProyectoGrado>> =>
    apiClient
      .post<
        Page<EntregableProyectoGrado>
      >(`/proyectos-grado/${proyectoGradoId}/entregables/estudiante`, req)
      .then((r) => r.data),

  consultarEntregablesJurado: (
    req: ConsultaCriteriaRequest,
  ): Promise<Page<EntregableProyectoGrado>> =>
    apiClient
      .post<Page<EntregableProyectoGrado>>('/entregables-proyecto-grado/jurado', req)
      .then((r) => r.data),
};
