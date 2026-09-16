// Espejo exacto de UtilTexto.PATRON_CORREO del backend.
export const EMAIL_REGEX =
  /^[_A-Za-z0-9\-+]+(\.[_A-Za-z0-9\-]+)*@[A-Za-z0-9\-]+(\.[A-Za-z0-9]+)*(\.[A-Za-z]{2,})$/;

export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Espejo exacto de RegistroUsuarioDomain.PATRON_CONTACTO del backend.
export const DIGITOS_REGEX = /^\d+$/;

// Espejo exacto de RegistroUsuarioDomain.PATRON_NOMBRE del backend.
export const NOMBRE_COMPLETO_REGEX = /^[\p{L} ]+$/u;
