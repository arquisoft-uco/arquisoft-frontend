import { z } from 'zod';
import { LIMITES, textoRequerido } from '../../../shared/validation';

export const registrarItemCualitativoAsesorSchema = z.object({
  nombre: textoRequerido(LIMITES.ITEM_CUALITATIVO_ASESOR_NOMBRE_MAX),
  descripcion: textoRequerido(LIMITES.ITEM_CUALITATIVO_ASESOR_DESCRIPCION_MAX),
});

export type RegistrarItemCualitativoAsesorValues = z.infer<
  typeof registrarItemCualitativoAsesorSchema
>;
