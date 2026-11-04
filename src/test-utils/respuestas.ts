import type { RespuestaSolicitud } from '../features/solicitudes/models/RespuestaSolicitud';

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

export const RESPUESTA_ASESOR: RespuestaSolicitud = {
  ...RESPUESTA,
  id: 'r-2',
  contenido: 'Nos vemos el lunes en mi oficina.',
  solicitud: {
    ...RESPUESTA.solicitud,
    id: 's-2',
    mensajeSolicitud: 'Necesito reprogramar la asesoría.',
    tipoSolicitudNombre: 'NOVEDAD_PARA_EL_ASESOR',
    destinatario: {
      usuarioId: 'u-3',
      identificador: '3001',
      nombre: 'Pedro Asesor',
      email: 'pedro@uco.edu.co',
    },
  },
};

export const RESPUESTA_CAMBIO_ASESOR: RespuestaSolicitud = {
  ...RESPUESTA,
  id: 'r-3',
  contenido: 'Aprobamos el cambio de asesor.',
  solicitud: {
    ...RESPUESTA.solicitud,
    id: 's-3',
    mensajeSolicitud: 'Quiero cambiar de asesor por incompatibilidad de horarios.',
    tipoSolicitudId: 't-3',
    tipoSolicitudNombre: 'CAMBIO_DE_ASESOR',
  },
};

export const RESPUESTA_AMPLIACION_PLAZO: RespuestaSolicitud = {
  ...RESPUESTA,
  id: 'r-4',
  contenido: 'Aprobamos la ampliación de plazo.',
  solicitud: {
    ...RESPUESTA.solicitud,
    id: 's-4',
    mensajeSolicitud: 'Necesito más tiempo para entregar el documento final.',
    tipoSolicitudId: 't-4',
    tipoSolicitudNombre: 'AMPLIACION_DE_PLAZO',
  },
};

export const RESPUESTA_REGISTRO_MODIFICACION_USUARIOS: RespuestaSolicitud = {
  ...RESPUESTA,
  id: 'r-5',
  contenido: 'Aprobamos el registro del usuario.',
  solicitud: {
    ...RESPUESTA.solicitud,
    id: 's-5',
    mensajeSolicitud: 'Solicito el registro de un nuevo usuario en la plataforma.',
    tipoSolicitudId: 't-5',
    tipoSolicitudNombre: 'REGISTRO_Y_MODIFICACION_DE_USUARIOS',
  },
};
