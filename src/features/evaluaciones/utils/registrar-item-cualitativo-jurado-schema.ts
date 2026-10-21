import { z } from 'zod';
import { LIMITES, textoRequerido } from '../../../shared/validation';
import { descripcionItemCualitativoJurado } from './item-cualitativo-jurado-schema';

export const registrarItemCualitativoJuradoSchema = z.object({
  nombre: textoRequerido(LIMITES.ITEM_CUALITATIVO_NOMBRE_MAX),
  descripcion: descripcionItemCualitativoJurado,
});

export type RegistrarItemCualitativoJuradoValues = z.infer<
  typeof registrarItemCualitativoJuradoSchema
>;
