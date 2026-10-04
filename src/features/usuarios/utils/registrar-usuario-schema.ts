import { z } from 'zod';
import {
  LIMITES,
  MENSAJES_VALIDACION,
  NOMBRE_COMPLETO_REGEX,
  emailValido,
  soloDigitosEntre,
  textoEntre,
  textoNoVacio,
} from '../../../shared/validation';
import { Rol } from '../../../shared/models/rol';

export const registrarUsuarioSchema = z
  .object({
    identificador: textoEntre(LIMITES.USUARIO_IDENTIFICADOR_MIN, LIMITES.USUARIO_IDENTIFICADOR_MAX),
    nombres: textoNoVacio(),
    apellidos: textoNoVacio(),
    email: emailValido(LIMITES.USUARIO_EMAIL_MIN, LIMITES.USUARIO_EMAIL_MAX),
    contacto: soloDigitosEntre(LIMITES.USUARIO_CONTACTO_MIN, LIMITES.USUARIO_CONTACTO_MAX),
    roles: z.array(z.nativeEnum(Rol)).optional(),
  })
  .superRefine((val, ctx) => {
    const nombres = val.nombres.trim();
    const apellidos = val.apellidos.trim();

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

    const longitud = `${nombres} ${apellidos}`.length;
    if (longitud < LIMITES.USUARIO_NOMBRE_MIN || longitud > LIMITES.USUARIO_NOMBRE_MAX) {
      const mensaje = MENSAJES_VALIDACION.longitudEntre(
        LIMITES.USUARIO_NOMBRE_MIN,
        LIMITES.USUARIO_NOMBRE_MAX,
      );
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['nombres'], message: mensaje });
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['apellidos'], message: mensaje });
    }
  });

export type RegistrarUsuarioValues = z.infer<typeof registrarUsuarioSchema>;
