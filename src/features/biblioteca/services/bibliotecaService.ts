import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { EnlaceDescargaVersion } from '../../../shared/models/EnlaceDescargaVersion';
import type { ConsultaCriteriaRequest } from '../../../shared/models/query-criteria';
import type { AutorDocumentacion } from '../models/AutorDocumentacion';
import type { CambiarEstadoDocumentacionRequest } from '../models/CambiarEstadoDocumentacionRequest';
import type { ConsultarEntregablesDisponiblesRequest } from '../models/ConsultarEntregablesDisponiblesRequest';
import type { Documentacion } from '../models/Documentacion';
import type { EntregableDisponible } from '../models/EntregableDisponible';
import type { EstadoDocumentacion } from '../models/biblioteca';
import type { RegistrarDocumentacionRequest } from '../models/RegistrarDocumentacionRequest';
import type { RegistrarDocumentacionResponse } from '../models/RegistrarDocumentacionResponse';

export const bibliotecaService = {
  consultarDocumentaciones: (req: ConsultaCriteriaRequest): Promise<Page<Documentacion>> =>
    apiClient
      .post<Page<Documentacion>>('/biblioteca/documentaciones/consultar', req)
      .then((r) => r.data),

  getEstadosDocumentacion: (): Promise<EstadoDocumentacion[]> =>
    apiClient.get<EstadoDocumentacion[]>('/biblioteca/estados-documentacion').then((r) => r.data),

  consultarAutoresDocumentacion: (documentacionId: string): Promise<AutorDocumentacion[]> =>
    apiClient
      .get<AutorDocumentacion[]>(`/biblioteca/documentaciones/${documentacionId}/autores`)
      .then((r) => r.data),

  consultarEntregablesDisponibles: (
    req: ConsultarEntregablesDisponiblesRequest,
  ): Promise<Page<EntregableDisponible>> =>
    apiClient
      .post<Page<EntregableDisponible>>('/biblioteca/entregables-proyecto-grado/consultar', req)
      .then((r) => r.data),

  registrarDocumentacion: (
    req: RegistrarDocumentacionRequest,
  ): Promise<RegistrarDocumentacionResponse> =>
    apiClient
      .post<RegistrarDocumentacionResponse>('/biblioteca/documentaciones', req)
      .then((r) => r.data),

  cambiarEstadoDocumentacion: (
    documentacionId: string,
    req: CambiarEstadoDocumentacionRequest,
  ): Promise<void> =>
    apiClient
      .patch(`/biblioteca/documentaciones/${documentacionId}/estado`, req)
      .then(() => undefined),

  obtenerEnlaceDescarga: (documentacionId: string): Promise<EnlaceDescargaVersion> =>
    apiClient
      .get<EnlaceDescargaVersion>(`/biblioteca/documentaciones/${documentacionId}/descarga`)
      .then((r) => r.data),

  obtenerEnlaceCompartir: (documentacionId: string): Promise<EnlaceDescargaVersion> =>
    apiClient
      .get<EnlaceDescargaVersion>(`/biblioteca/documentaciones/${documentacionId}/enlace`)
      .then((r) => r.data),
};
