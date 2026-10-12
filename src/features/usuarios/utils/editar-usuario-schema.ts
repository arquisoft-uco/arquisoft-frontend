import { z } from 'zod';
import {
  LIMITES,
  emailValido,
  soloDigitosEntre,
  textoEntre,
  textoNoVacio,
  validarParDeNombres,
} from '../../../shared/validation';

export const editarUsuarioSchema = z
  .object({
    identificador: textoEntre(LIMITES.USUARIO_IDENTIFICADOR_MIN, LIMITES.USUARIO_IDENTIFICADOR_MAX),
    nombres: textoNoVacio(),
    apellidos: textoNoVacio(),
    email: emailValido(LIMITES.USUARIO_EMAIL_MIN, LIMITES.USUARIO_EMAIL_MAX),
    contacto: soloDigitosEntre(LIMITES.USUARIO_CONTACTO_MIN, LIMITES.USUARIO_CONTACTO_MAX),
  })
  .superRefine((val, ctx) =>
    validarParDeNombres(val, ctx, LIMITES.USUARIO_NOMBRE_MIN, LIMITES.USUARIO_NOMBRE_MAX),
  );

export type EditarUsuarioValues = z.infer<typeof editarUsuarioSchema>;
