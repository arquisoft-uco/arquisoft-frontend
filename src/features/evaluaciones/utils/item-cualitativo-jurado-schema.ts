import { LIMITES, textoRequerido } from '../../../shared/validation';

export const descripcionItemCualitativoJurado = textoRequerido(
  LIMITES.ITEM_CUALITATIVO_DESCRIPCION_MAX,
);
