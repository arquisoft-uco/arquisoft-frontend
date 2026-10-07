import { z } from 'zod';
import { LIMITES, textoRequerido } from '../../../shared/validation';

export const registrarItemCualitativoJuradoSchema = z.object({
  nombre: textoRequerido(LIMITES.ITEM_CUALITATIVO_NOMBRE_MAX),
  descripcion: textoRequerido(LIMITES.ITEM_CUALITATIVO_DESCRIPCION_MAX),
});

export type RegistrarItemCualitativoJuradoValues = z.infer<
  typeof registrarItemCualitativoJuradoSchema
>;
