import { z } from 'zod';
import type { ZodType, ZodTypeDef } from 'zod';
import { esquemaOrigen, esquemaSearch } from '../../../shared/utils/esquemas-navegacion';
import type { NavegacionDetalleFicha } from '../models/ResumenFicha';

const campos = {
  id: z.string(),
  titulo: z.string(),
  estadoId: z.string().optional().catch(undefined),
  estadoNombre: z.string().optional().catch(undefined),
  fechaActualizacion: z.string().optional().catch(undefined),
  asesorId: z.string().optional().catch(undefined),
  asesorNombre: z.string().optional().catch(undefined),
  asesorEmail: z.string().optional().catch(undefined),
};

export const esquemaContextoFicha: ZodType<NavegacionDetalleFicha, ZodTypeDef, unknown> = z.object({
  resumen: z.object(campos),
  search: esquemaSearch,
  origen: esquemaOrigen.optional().catch(undefined),
});
