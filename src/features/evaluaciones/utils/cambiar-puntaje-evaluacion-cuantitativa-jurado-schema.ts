import { z } from 'zod';
import { enteroEntre, LIMITES } from '../../../shared/validation';

export function cambiarPuntajeEvaluacionCuantitativaJuradoSchema(valorMaximo: number) {
  return z.object({ puntaje: enteroEntre(LIMITES.ITEM_CUANTITATIVO_VALOR_MIN, valorMaximo) });
}

export type CambiarPuntajeEvaluacionCuantitativaJuradoValues = { puntaje: string };
