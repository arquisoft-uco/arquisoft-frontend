export interface ParticipanteSolicitud {
  usuarioId: string;
  identificador: string;
  nombre: string;
  email: string;
}

export interface Solicitud {
  id: string;
  mensajeSolicitud: string;
  fechaCreacion: string;
  tipoSolicitudId: string;
  tipoSolicitudNombre: string;
  remitente: ParticipanteSolicitud;
  destinatario: ParticipanteSolicitud;
}
