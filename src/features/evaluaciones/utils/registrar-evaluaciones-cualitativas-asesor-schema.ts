import { z } from 'zod';
import { listaNoVaciaSinDuplicados, uuidValido } from '../../../shared/validation';

export const registrarEvaluacionesCualitativasAsesorSchema = z.object({
  evaluaciones: listaNoVaciaSinDuplicados(
    z.object({ itemId: uuidValido(), criterioId: uuidValido() }),
    (par) => par.itemId,
  ),
});

export type RegistrarEvaluacionesCualitativasAsesorValues = z.infer<
  typeof registrarEvaluacionesCualitativasAsesorSchema
>;
