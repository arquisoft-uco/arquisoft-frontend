import { z } from 'zod';
import { listaNoVaciaSinDuplicados, uuidValido } from '../../../shared/validation';

export const registrarEvaluacionesCualitativasJuradoSchema = z.object({
  evaluaciones: listaNoVaciaSinDuplicados(
    z.object({ itemId: uuidValido(), criterioId: uuidValido() }),
    (par) => par.itemId,
  ),
});

export type RegistrarEvaluacionesCualitativasJuradoValues = z.infer<
  typeof registrarEvaluacionesCualitativasJuradoSchema
>;
