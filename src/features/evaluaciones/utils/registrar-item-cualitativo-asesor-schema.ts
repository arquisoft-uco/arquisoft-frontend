import { z } from 'zod';
import { enteroEntre, LIMITES, textoRequerido } from '../../../shared/validation';

export const pesoItemCualitativoAsesor = enteroEntre(
  LIMITES.ITEM_CUALITATIVO_ASESOR_PESO_MIN,
  LIMITES.ITEM_CUALITATIVO_ASESOR_PESO_MAX,
);

export const registrarItemCualitativoAsesorSchema = z.object({
  nombre: textoRequerido(LIMITES.ITEM_CUALITATIVO_ASESOR_NOMBRE_MAX),
  descripcion: textoRequerido(LIMITES.ITEM_CUALITATIVO_ASESOR_DESCRIPCION_MAX),
  peso: pesoItemCualitativoAsesor,
});

export type RegistrarItemCualitativoAsesorValues = z.infer<
  typeof registrarItemCualitativoAsesorSchema
>;

export const modificarItemCualitativoAsesorSchema = z.object({
  descripcion: textoRequerido(LIMITES.ITEM_CUALITATIVO_ASESOR_DESCRIPCION_MAX),
  peso: pesoItemCualitativoAsesor,
});

export type ModificarItemCualitativoAsesorValues = z.infer<
  typeof modificarItemCualitativoAsesorSchema
>;
