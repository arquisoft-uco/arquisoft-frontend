import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { EnviarSolicitudNovedadAsesorRequest } from '../models/EnviarSolicitudNovedadAsesorRequest';
import type { EnviarSolicitudNovedadCoordinadorRequest } from '../models/EnviarSolicitudNovedadCoordinadorRequest';
import type { Solicitud } from '../models/Solicitud';
import type { SolicitudCreadaResponse } from '../models/SolicitudCreadaResponse';

export const solicitudesService = {
  enviarSolicitudNovedadCoordinador: (
    req: EnviarSolicitudNovedadCoordinadorRequest,
  ): Promise<SolicitudCreadaResponse> =>
    apiClient
      .post<SolicitudCreadaResponse>('/solicitudes/novedad-coordinador', {
        destinatario: req.destinatario,
        mensajeSolicitud: req.mensajeSolicitud,
      })
      .then((r) => r.data),

  enviarSolicitudNovedadAsesor: (
    req: EnviarSolicitudNovedadAsesorRequest,
  ): Promise<SolicitudCreadaResponse> =>
    apiClient
      .post<SolicitudCreadaResponse>('/solicitudes/novedad-asesor', {
        destinatario: req.destinatario,
        mensajeSolicitud: req.mensajeSolicitud,
      })
      .then((r) => r.data),

  consultarSolicitudesNovedadCoordinadorEnviadas: (
    page = 0,
    size = 10,
  ): Promise<Page<Solicitud>> =>
    apiClient
      .post<Page<Solicitud>>('/solicitudes/novedad-coordinador/enviadas', {
        pagina: page,
        tamanio: size,
      })
      .then((r) => r.data),

  eliminarSolicitudNovedadCoordinador: (solicitudId: string): Promise<void> =>
    apiClient.delete(`/solicitudes/novedad-coordinador/${solicitudId}`).then(() => undefined),
};
