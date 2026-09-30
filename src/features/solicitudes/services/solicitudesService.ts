import apiClient from '../../../api/axiosInstance';
import type { EnviarSolicitudAmpliacionPlazoRequest } from '../models/EnviarSolicitudAmpliacionPlazoRequest';
import type { EnviarSolicitudCambioAsesorRequest } from '../models/EnviarSolicitudCambioAsesorRequest';
import type { EnviarSolicitudNovedadAsesorRequest } from '../models/EnviarSolicitudNovedadAsesorRequest';
import type { EnviarSolicitudNovedadCoordinadorRequest } from '../models/EnviarSolicitudNovedadCoordinadorRequest';
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

  enviarSolicitudCambioAsesor: (
    req: EnviarSolicitudCambioAsesorRequest,
  ): Promise<SolicitudCreadaResponse> =>
    apiClient
      .post<SolicitudCreadaResponse>('/solicitudes/cambio-asesor', {
        destinatario: req.destinatario,
        mensajeSolicitud: req.mensajeSolicitud,
      })
      .then((r) => r.data),

  enviarSolicitudAmpliacionPlazo: (
    req: EnviarSolicitudAmpliacionPlazoRequest,
  ): Promise<SolicitudCreadaResponse> =>
    apiClient
      .post<SolicitudCreadaResponse>('/solicitudes/ampliacion-plazo', {
        destinatario: req.destinatario,
        mensajeSolicitud: req.mensajeSolicitud,
      })
      .then((r) => r.data),
};
