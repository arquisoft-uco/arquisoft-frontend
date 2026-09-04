import { z } from 'zod';
import { EMAIL_REGEX, UUID_REGEX } from './expresiones-regulares';
import { MENSAJES_VALIDACION } from './mensajes-validacion';

export function textoRequerido(max: number) {
  return z
    .string()
    .min(1, MENSAJES_VALIDACION.requerido)
    .max(max, MENSAJES_VALIDACION.longitudMaxima(max));
}

export function opcionRequerida() {
  return z.string().min(1, MENSAJES_VALIDACION.seleccioneOpcion);
}

export function emailValido() {
  return z
    .string()
    .min(1, MENSAJES_VALIDACION.requerido)
    .regex(EMAIL_REGEX, MENSAJES_VALIDACION.formatoEmail);
}

export function uuidValido() {
  return z.string().regex(UUID_REGEX, MENSAJES_VALIDACION.formatoUuid);
}

export function listaConMaximo(max: number) {
  return z.array(z.string()).max(max, MENSAJES_VALIDACION.listaMaxima(max));
}
