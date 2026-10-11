import { z } from 'zod';
import {
  LIMITES,
  emailValido,
  soloDigitosEntre,
  textoEntre,
  textoNoVacio,
  validarParDeNombres,
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
  .superRefine((val, ctx) =>
    validarParDeNombres(val, ctx, LIMITES.USUARIO_NOMBRE_MIN, LIMITES.USUARIO_NOMBRE_MAX),
  );

export type RegistrarUsuarioValues = z.infer<typeof registrarUsuarioSchema>;
