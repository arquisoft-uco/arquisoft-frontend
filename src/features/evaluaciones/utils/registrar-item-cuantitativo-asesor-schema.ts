import { z } from 'zod';
import { LIMITES, enteroEntre, opcionRequerida, textoRequerido } from '../../../shared/validation';

export const registrarItemCuantitativoAsesorSchema = z.object({
  nombre: textoRequerido(LIMITES.ITEM_CUANTITATIVO_ASESOR_NOMBRE_MAX),
  descripcion: textoRequerido(LIMITES.ITEM_CUANTITATIVO_ASESOR_DESCRIPCION_MAX),
  categoriaId: opcionRequerida(),
  valor: enteroEntre(
    LIMITES.ITEM_CUANTITATIVO_ASESOR_VALOR_MIN,
    LIMITES.ITEM_CUANTITATIVO_ASESOR_VALOR_MAX,
  ),
});

export type RegistrarItemCuantitativoAsesorValues = z.infer<
  typeof registrarItemCuantitativoAsesorSchema
>;
