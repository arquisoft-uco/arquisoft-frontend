import { z } from 'zod';
import {
  LIMITES,
  listaNoVaciaSinDuplicados,
  textoRequerido,
  uuidValido,
} from '../../../shared/validation';
import { puntajeValido } from './puntaje-valido';

export const registrarEvaluacionesCuantitativasJuradoSchema = z.object({
  evaluaciones: listaNoVaciaSinDuplicados(
    z.object({
      itemId: uuidValido(),
      puntaje: puntajeValido,
      observacion: textoRequerido(LIMITES.OBSERVACION_ITEM_JURADO_DESCRIPCION_MAX).optional(),
    }),
    (par) => par.itemId,
  ),
});

export type RegistrarEvaluacionesCuantitativasJuradoValues = z.infer<
  typeof registrarEvaluacionesCuantitativasJuradoSchema
>;
