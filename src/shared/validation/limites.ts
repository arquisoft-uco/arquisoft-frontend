// Límites alineados con las restricciones @Size del backend.
export const LIMITES = {
  TITULO_PROYECTO_MAX: 100,
  ITEM_CONTENIDO_MAX: 7000,
  ESTADO_EVALUACION_ID_MAX: 50,
  ESTUDIANTES_MAX: 3,
  // FichasLimits.ObservacionEvaluacion.OBSERVACION_MAX
  OBSERVACION_EVALUACION_MAX: 200,
  // No es un @Size del DTO (record desnudo): origen es la validación de dominio
  // (ApplicationValidationException) de EnviarSolicitudNovedadCoordinador (HU-081) y de
  // EnviarSolicitudNovedadAsesor (HU-082), confirmado con 400 real.
  MENSAJE_SOLICITUD_MAX: 100,
  // Origen: ResponderSolicitudNovedadCoordinadorCommand.crear
  // (ValidatorLongitud.longitudEntre(1, 100)), SolicitudesLimits.Respuesta.CONTENIDO_MAX.
  RESPUESTA_CONTENIDO_MAX: 100,
  USUARIO_IDENTIFICADOR_MIN: 4,
  USUARIO_IDENTIFICADOR_MAX: 30,
  USUARIO_NOMBRE_MIN: 2,
  USUARIO_NOMBRE_MAX: 50,
  USUARIO_EMAIL_MIN: 6,
  USUARIO_EMAIL_MAX: 50,
  USUARIO_CONTACTO_MIN: 10,
  USUARIO_CONTACTO_MAX: 15,
} as const;
