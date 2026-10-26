import { z } from 'zod';
import { LIMITES, textoRequerido } from '../../../shared/validation';

export const generarRepositorioSchema = z.object({
  nombreRepositorio: textoRequerido(LIMITES.REPOSITORIO_NOMBRE_MAX),
  descripcion: textoRequerido(LIMITES.REPOSITORIO_DESCRIPCION_MAX),
});

export type GenerarRepositorioValues = z.infer<typeof generarRepositorioSchema>;

export const ETIQUETAS_CAMPO: Record<keyof GenerarRepositorioValues, string> = {
  nombreRepositorio: 'Nombre',
  descripcion: 'Descripción',
};

export const CAMPOS = Object.keys(ETIQUETAS_CAMPO) as (keyof GenerarRepositorioValues)[];
