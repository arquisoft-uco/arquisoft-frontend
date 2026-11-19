import { z } from 'zod';
import { opcionRequerida, uuidValido } from '../../../shared/validation';

export const cambiarCriterioEvaluacionCualitativaAsesorSchema = z.object({
  criterioId: opcionRequerida().pipe(uuidValido()),
});

export type CambiarCriterioEvaluacionCualitativaAsesorValues = z.infer<
  typeof cambiarCriterioEvaluacionCualitativaAsesorSchema
>;
