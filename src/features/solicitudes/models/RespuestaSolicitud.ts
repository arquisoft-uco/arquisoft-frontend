import type { Solicitud } from './Solicitud';

export interface RespuestaSolicitud {
  id: string;
  contenido: string;
  fechaRespuesta: string;
  estadoRespuestaId: string;
  estadoRespuestaNombre: string;
  solicitud: Solicitud;
}
