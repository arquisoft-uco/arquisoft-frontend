import apiClient from '../../../api/axiosInstance';
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
};
