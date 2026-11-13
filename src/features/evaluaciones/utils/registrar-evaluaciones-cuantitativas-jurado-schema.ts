import { z } from 'zod';
import {
  enteroEntre,
  LIMITES,
  listaNoVaciaSinDuplicados,
  MENSAJES_VALIDACION,
  uuidValido,
} from '../../../shared/validation';

const REGLA_PUNTAJE = enteroEntre(
  LIMITES.ITEM_CUANTITATIVO_VALOR_MIN,
  LIMITES.ITEM_CUANTITATIVO_VALOR_MAX,
);

const puntajeValido = z
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

export const registrarEvaluacionesCuantitativasJuradoSchema = z.object({
  evaluaciones: listaNoVaciaSinDuplicados(
    z.object({ itemId: uuidValido(), puntaje: puntajeValido }),
    (par) => par.itemId,
  ),
});

export type RegistrarEvaluacionesCuantitativasJuradoValues = z.infer<
  typeof registrarEvaluacionesCuantitativasJuradoSchema
>;
