import { z } from 'zod';
import type { ZodType, ZodTypeDef } from 'zod';
import { esquemaSearch } from '../../../shared/utils/esquemas-navegacion';
import type { NavegacionVersionesRepositorio } from '../models/NavegacionVersionesRepositorio';

export const esquemaContextoVersiones: ZodType<
  NavegacionVersionesRepositorio,
  ZodTypeDef,
  unknown
> = z.object({
  search: esquemaSearch,
  repositorio: z.object({ id: z.string(), nombre: z.string() }),
});
