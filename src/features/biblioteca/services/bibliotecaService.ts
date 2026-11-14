import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { ConsultaCriteriaRequest } from '../../../shared/models/query-criteria';
import type { Documentacion } from '../models/Documentacion';
import type { EstadoDocumentacion } from '../models/biblioteca';

export const bibliotecaService = {
  consultarDocumentaciones: (req: ConsultaCriteriaRequest): Promise<Page<Documentacion>> =>
    apiClient
      .post<Page<Documentacion>>('/biblioteca/documentaciones/consultar', req)
      .then((r) => r.data),

  getEstadosDocumentacion: (): Promise<EstadoDocumentacion[]> =>
    apiClient.get<EstadoDocumentacion[]>('/biblioteca/estados-documentacion').then((r) => r.data),
};
