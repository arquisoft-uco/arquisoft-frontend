import type { RespuestaSolicitud } from '../models/RespuestaSolicitud';

export const RESPUESTA: RespuestaSolicitud = {
  id: 'r-1',
  contenido: 'Programemos una reunión.',
  fechaRespuesta: '2026-09-02T10:00:00Z',
  estadoRespuestaId: 'APROBADA',
  estadoRespuestaNombre: 'Aprobada',
  solicitud: {
    id: 's-1',
    mensajeSolicitud: 'No he podido contactar a mi asesor.',
    fechaCreacion: '2026-09-01T15:30:00Z',
    tipoSolicitudId: 't-1',
    tipoSolicitudNombre: 'NOVEDAD_PARA_EL_COORDINADOR',
    remitente: {
      usuarioId: 'u-1',
      identificador: '2001',
      nombre: 'Luis Gómez',
      email: 'luis@uco.edu.co',
    },
    destinatario: {
      usuarioId: 'u-2',
      identificador: '1001',
      nombre: 'Ana Coordinadora',
      email: 'ana@uco.edu.co',
    },
  },
};
