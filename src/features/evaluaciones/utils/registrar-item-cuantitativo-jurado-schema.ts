import { z } from 'zod';
import { LIMITES, enteroEntre, opcionRequerida, textoRequerido } from '../../../shared/validation';

export const registrarItemCuantitativoJuradoSchema = z.object({
  nombre: textoRequerido(LIMITES.ITEM_CUANTITATIVO_NOMBRE_MAX),
  descripcion: textoRequerido(LIMITES.ITEM_CUANTITATIVO_DESCRIPCION_MAX),
  categoriaId: opcionRequerida(),
  valor: enteroEntre(LIMITES.ITEM_CUANTITATIVO_VALOR_MIN, LIMITES.ITEM_CUANTITATIVO_VALOR_MAX),
});

export type RegistrarItemCuantitativoJuradoValues = z.infer<
  typeof registrarItemCuantitativoJuradoSchema
>;
