import { z } from 'zod';
import { LIMITES, enteroEntre } from '../../../shared/validation';

export function crearCambiarPuntajeEvaluacionCuantitativaAsesorSchema(valorMaximo: number) {
  return z.object({
    puntaje: enteroEntre(
      LIMITES.ITEM_CUANTITATIVO_VALOR_MIN,
      Math.min(valorMaximo, LIMITES.ITEM_CUANTITATIVO_VALOR_MAX),
    ),
  });
}

export type CambiarPuntajeEvaluacionCuantitativaAsesorValues = { puntaje: string };
