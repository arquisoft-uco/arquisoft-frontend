import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { ConsultaCriteriaRequest } from '../../../shared/models/query-criteria';
import type { EnviarSolicitudNovedadAsesorRequest } from '../models/EnviarSolicitudNovedadAsesorRequest';
import type { EnviarSolicitudNovedadCoordinadorRequest } from '../models/EnviarSolicitudNovedadCoordinadorRequest';
import type { EstadoRespuesta } from '../models/EstadoRespuesta';
import type { ModificarEstadoRespuestaNovedadCoordinadorRequest } from '../models/ModificarEstadoRespuestaNovedadCoordinadorRequest';
import type { ResponderSolicitudNovedadCoordinadorRequest } from '../models/ResponderSolicitudNovedadCoordinadorRequest';
import type { RespuestaSolicitud } from '../models/RespuestaSolicitud';
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

  consultarSolicitudesNovedadCoordinadorEnviadas: (page = 0, size = 10): Promise<Page<Solicitud>> =>
    apiClient
      .post<Page<Solicitud>>('/solicitudes/novedad-coordinador/enviadas', {
        pagina: page,
        tamanio: size,
      })
      .then((r) => r.data),

  consultarSolicitudesNovedadAsesorEnviadas: (page = 0, size = 10): Promise<Page<Solicitud>> =>
    apiClient
      .post<Page<Solicitud>>('/solicitudes/novedad-asesor/enviadas', {
        pagina: page,
        tamanio: size,
      })
      .then((r) => r.data),

  consultarSolicitudesNovedadCoordinadorRecibidas: (
    page = 0,
    size = 10,
  ): Promise<Page<Solicitud>> =>
    apiClient
      .post<Page<Solicitud>>('/solicitudes/novedad-coordinador/recibidas', {
        pagina: page,
        tamanio: size,
      })
      .then((r) => r.data),

  consultarRespuestasNovedadCoordinadorEnviadas: (
    criterio: ConsultaCriteriaRequest,
  ): Promise<Page<RespuestaSolicitud>> =>
    apiClient
      .post<
        Page<RespuestaSolicitud>
      >('/solicitudes/novedad-coordinador/respuestas/enviadas', criterio)
      .then((r) => r.data),

  consultarRespuestasNovedadCoordinadorRecibidas: (
    criterio: ConsultaCriteriaRequest,
  ): Promise<Page<RespuestaSolicitud>> =>
    apiClient
      .post<
        Page<RespuestaSolicitud>
      >('/solicitudes/novedad-coordinador/respuestas/recibidas', criterio)
      .then((r) => r.data),

  getEstadosRespuesta: (): Promise<EstadoRespuesta[]> =>
    apiClient.get<EstadoRespuesta[]>('/solicitudes/estados-respuesta').then((r) => r.data),

  eliminarSolicitudNovedadCoordinador: (solicitudId: string): Promise<void> =>
    apiClient.delete(`/solicitudes/novedad-coordinador/${solicitudId}`).then(() => undefined),

  responderSolicitudNovedadCoordinador: (
    req: ResponderSolicitudNovedadCoordinadorRequest,
  ): Promise<SolicitudCreadaResponse> =>
    apiClient
      .post<SolicitudCreadaResponse>(
        `/solicitudes/novedad-coordinador/${req.solicitudId}/respuesta`,
        { contenido: req.contenido },
      )
      .then((r) => r.data),

  eliminarRespuestaNovedadCoordinador: (solicitudId: string): Promise<void> =>
    apiClient
      .delete(`/solicitudes/novedad-coordinador/${solicitudId}/respuesta`)
      .then(() => undefined),

  modificarEstadoRespuestaNovedadCoordinador: (
    req: ModificarEstadoRespuestaNovedadCoordinadorRequest,
  ): Promise<void> =>
    apiClient
      .patch(`/solicitudes/novedad-coordinador/${req.solicitudId}/respuesta/estado`, {
        nuevoEstado: req.nuevoEstado,
      })
      .then(() => undefined),
};
