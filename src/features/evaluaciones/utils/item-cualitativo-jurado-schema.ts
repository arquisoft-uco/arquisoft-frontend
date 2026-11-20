import { z } from 'zod';
import { enteroEntre, LIMITES, textoRequerido } from '../../../shared/validation';

export const descripcionItemCualitativoJurado = textoRequerido(
  LIMITES.ITEM_CUALITATIVO_DESCRIPCION_MAX,
);

export const pesoItemCualitativoJurado = enteroEntre(
  LIMITES.ITEM_CUALITATIVO_PESO_MIN,
  LIMITES.ITEM_CUALITATIVO_PESO_MAX,
);

export const modificarItemCualitativoJuradoSchema = z.object({
  descripcion: descripcionItemCualitativoJurado,
  peso: pesoItemCualitativoJurado,
});

export type ModificarItemCualitativoJuradoValues = z.infer<
  typeof modificarItemCualitativoJuradoSchema
>;
