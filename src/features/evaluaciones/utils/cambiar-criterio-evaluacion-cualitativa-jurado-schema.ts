import { z } from 'zod';
import { opcionRequerida, uuidValido } from '../../../shared/validation';

export const cambiarCriterioEvaluacionCualitativaJuradoSchema = z.object({
  criterioId: opcionRequerida().pipe(uuidValido()),
});
