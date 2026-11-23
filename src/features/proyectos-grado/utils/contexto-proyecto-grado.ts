import { z } from 'zod';
import type { ZodType, ZodTypeDef } from 'zod';
import { esquemaSearch } from '../../../shared/utils/esquemas-navegacion';
import type { NavegacionDetalleProyecto } from '../models/ResumenProyectoGrado';

export const esquemaContextoProyectoGrado: ZodType<NavegacionDetalleProyecto, ZodTypeDef, unknown> =
  z.object({
    resumen: z.object({
      id: z.string(),
      titulo: z.string(),
      estadoId: z.string().optional().catch(undefined),
      estadoNombre: z.string().optional().catch(undefined),
    }),
    search: esquemaSearch,
  });
