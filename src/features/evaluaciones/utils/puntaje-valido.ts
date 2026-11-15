import { z } from 'zod';
import { enteroEntre, LIMITES, MENSAJES_VALIDACION } from '../../../shared/validation';

const REGLA_PUNTAJE = enteroEntre(
  LIMITES.ITEM_CUANTITATIVO_VALOR_MIN,
  LIMITES.ITEM_CUANTITATIVO_VALOR_MAX,
);

export const puntajeValido = z
  .number({
    required_error: MENSAJES_VALIDACION.requerido,
    invalid_type_error: MENSAJES_VALIDACION.requerido,
  })
  .superRefine((puntaje, ctx) => {
    const resultado = REGLA_PUNTAJE.safeParse(String(puntaje));
    if (resultado.success) return;
    for (const issue of resultado.error.issues) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: issue.message });
    }
  });
