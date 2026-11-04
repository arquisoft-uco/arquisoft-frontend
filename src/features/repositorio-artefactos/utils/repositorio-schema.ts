import { z } from 'zod';
import { LIMITES, textoRequerido } from '../../../shared/validation';

export const repositorioSchema = z.object({
  nombreRepositorio: textoRequerido(LIMITES.REPOSITORIO_NOMBRE_MAX),
  descripcion: textoRequerido(LIMITES.REPOSITORIO_DESCRIPCION_MAX),
});

export type RepositorioValues = z.infer<typeof repositorioSchema>;

export const ETIQUETAS_CAMPO: Record<keyof RepositorioValues, string> = {
  nombreRepositorio: 'Nombre',
  descripcion: 'Descripción',
};

export const CAMPOS = Object.keys(ETIQUETAS_CAMPO) as (keyof RepositorioValues)[];
