import { z } from 'zod';
import {
  DIGITOS_REGEX,
  EMAIL_REGEX,
  NOMBRE_COMPLETO_REGEX,
  UUID_REGEX,
} from './expresiones-regulares';
import { MENSAJES_VALIDACION } from './mensajes-validacion';

export function textoRequerido(max: number) {
  return z
    .string()
    .trim()
    .min(1, MENSAJES_VALIDACION.requerido)
    .max(max, MENSAJES_VALIDACION.longitudMaxima(max));
}

export function opcionRequerida() {
  return z.string().min(1, MENSAJES_VALIDACION.seleccioneOpcion);
}

// Espejo de ValidatorTexto.noEnBlanco + ValidatorLongitud.longitudEntre del backend,
// en ese orden exacto: primero requerido, luego longitud.
export function textoEntre(min: number, max: number) {
  return z.string().superRefine((val, ctx) => {
    const valor = val.trim();
    if (valor.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: MENSAJES_VALIDACION.requerido });
      return;
    }
    if (valor.length < min || valor.length > max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: MENSAJES_VALIDACION.longitudEntre(min, max),
      });
    }
  });
}

// Espejo de ValidatorTexto.noEnBlanco del backend, sin límite de longitud individual.
export function textoNoVacio() {
  return z.string().trim().min(1, MENSAJES_VALIDACION.requerido);
}

// Espejo de ValidatorTexto.noEnBlanco + formato (DIGITOS_REGEX) + ValidatorLongitud.longitudEntre,
// en ese orden exacto.
export function soloDigitosEntre(min: number, max: number) {
  return z.string().superRefine((val, ctx) => {
    const valor = val.trim();
    if (valor.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: MENSAJES_VALIDACION.requerido });
      return;
    }
    if (!DIGITOS_REGEX.test(valor)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: MENSAJES_VALIDACION.soloDigitos });
      return;
    }
    if (valor.length < min || valor.length > max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: MENSAJES_VALIDACION.longitudEntre(min, max),
      });
    }
  });
}

// Espejo de ValidatorTexto.noEnBlanco + formato (EMAIL_REGEX) + ValidatorLongitud.longitudEntre,
// en ese orden exacto. (min, max) es retrocompatible: sin argumentos se comporta como antes.
export function emailValido(min?: number, max?: number) {
  return z.string().superRefine((val, ctx) => {
    const valor = val.trim();
    if (valor.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: MENSAJES_VALIDACION.requerido });
      return;
    }
    if (!EMAIL_REGEX.test(valor)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: MENSAJES_VALIDACION.formatoEmail });
      return;
    }
    if (min !== undefined && max !== undefined && (valor.length < min || valor.length > max)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: MENSAJES_VALIDACION.longitudEntre(min, max),
      });
    }
  });
}

export function uuidValido() {
  return z.string().regex(UUID_REGEX, MENSAJES_VALIDACION.formatoUuid);
}

export function listaConMaximo(max: number) {
  return z.array(z.string()).max(max, MENSAJES_VALIDACION.listaMaxima(max));
}

// Espejo de la regla compuesta del backend sobre `nombres + " " + apellidos`: longitud del conjunto
// (error en ambos campos) y luego formato (error en el campo con el carácter inválido).
export function validarParDeNombres(
  valores: { nombres: string; apellidos: string },
  ctx: z.RefinementCtx,
  min: number,
  max: number,
) {
  const nombres = valores.nombres.trim();
  const apellidos = valores.apellidos.trim();

  const longitud = `${nombres} ${apellidos}`.length;
  if (longitud < min || longitud > max) {
    const message = MENSAJES_VALIDACION.longitudEntre(min, max);
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['nombres'], message });
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['apellidos'], message });
  }
  if (!NOMBRE_COMPLETO_REGEX.test(nombres)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['nombres'],
      message: MENSAJES_VALIDACION.formatoNombre,
    });
  }
  if (!NOMBRE_COMPLETO_REGEX.test(apellidos)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['apellidos'],
      message: MENSAJES_VALIDACION.formatoNombre,
    });
  }
}
