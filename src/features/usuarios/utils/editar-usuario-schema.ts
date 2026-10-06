import { z } from 'zod';
import {
  LIMITES,
  MENSAJES_VALIDACION,
  NOMBRE_COMPLETO_REGEX,
  emailValido,
  soloDigitosEntre,
  textoEntre,
} from '../../../shared/validation';

export const editarUsuarioSchema = z
  .object({
    identificador: textoEntre(LIMITES.USUARIO_IDENTIFICADOR_MIN, LIMITES.USUARIO_IDENTIFICADOR_MAX),
    nombre: textoEntre(LIMITES.USUARIO_NOMBRE_MIN, LIMITES.USUARIO_NOMBRE_MAX),
    email: emailValido(LIMITES.USUARIO_EMAIL_MIN, LIMITES.USUARIO_EMAIL_MAX),
    contacto: soloDigitosEntre(LIMITES.USUARIO_CONTACTO_MIN, LIMITES.USUARIO_CONTACTO_MAX),
  })
  .superRefine((val, ctx) => {
    if (!NOMBRE_COMPLETO_REGEX.test(val.nombre.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['nombre'],
        message: MENSAJES_VALIDACION.formatoNombre,
      });
    }
  });

export type EditarUsuarioValues = z.infer<typeof editarUsuarioSchema>;
