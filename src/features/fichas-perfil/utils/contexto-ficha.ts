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
};

const origen = esquemaOrigen.optional().catch(undefined);

export const esquemaEstadoFicha: ZodType<NavegacionDetalleFicha, ZodTypeDef, unknown> = z.object({
  resumen: z.object({
    ...campos,
    asesorNombre: z.string().optional().catch(undefined),
    asesorEmail: z.string().optional().catch(undefined),
  }),
  search: esquemaSearch,
  origen,
});

// El snapshot omite nombre y correo del asesor: son datos personales.
export const esquemaSnapshotFicha: ZodType<NavegacionDetalleFicha, ZodTypeDef, unknown> = z.object({
  resumen: z.object(campos),
  search: esquemaSearch,
  origen,
});
