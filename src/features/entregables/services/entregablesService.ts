import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { ConsultaCriteriaRequest } from '../../../shared/models/query-criteria';
import type { CambiarEstadoEntregableRequest } from '../models/CambiarEstadoEntregableRequest';
import type { GenerarEntregableResponse } from '../models/GenerarEntregableResponse';
import type { ProyectoGradoAsesor } from '../models/ProyectoGradoAsesor';
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

  generarEntregable: (proyectoGradoId: string): Promise<GenerarEntregableResponse> =>
    apiClient
      .post<GenerarEntregableResponse>(`/proyectos-grado/${proyectoGradoId}/entregables`)
      .then((r) => r.data),

  cambiarEstadoEntregable: (
    entregableId: string,
    req: CambiarEstadoEntregableRequest,
  ): Promise<void> =>
    apiClient
      .patch(`/entregables-proyecto-grado/${entregableId}/estado`, {
        estadoEntregable: req.estadoEntregableId,
      })
      .then(() => undefined),

  consultarProyectosAsesor: (): Promise<ProyectoGradoAsesor[]> => {
    const req: ConsultaCriteriaRequest = {
      pagina: 0,
      tamanio: 100,
      ordenamiento: ['tituloProyecto:ASC'],
    };
    return apiClient
      .post<Page<ProyectoGradoAsesor>>('/proyectos-grado/asesor', req)
      .then((r) => r.data.content);
  },
};
