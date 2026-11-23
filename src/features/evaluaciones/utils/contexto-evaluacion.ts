import { z } from 'zod';
import type { ZodType, ZodTypeDef } from 'zod';
import { esquemaSearch } from '../../../shared/utils/esquemas-navegacion';
import type { NavegacionEvaluacionJurado } from '../models/NavegacionEvaluacionJurado';
import type { NavegacionJuradosEvaluacion } from '../models/ResumenEvaluacion';

const esquemaResumenEvaluacion = z.object({
  id: z.string(),
  proyecto: z.string(),
  version: z.number(),
  finalizada: z.boolean().optional().catch(undefined),
});

export const esquemaContextoEvaluacion: ZodType<NavegacionJuradosEvaluacion, ZodTypeDef, unknown> =
  z.object({
    resumen: esquemaResumenEvaluacion,
    search: esquemaSearch,
  });

export const esquemaContextoJurado: ZodType<NavegacionEvaluacionJurado, ZodTypeDef, unknown> =
  z.object({
    evaluacionJuradoId: z.string(),
    evaluacionId: z.string(),
    jurado: z.string(),
    resumen: esquemaResumenEvaluacion,
    search: esquemaSearch,
    searchJurados: esquemaSearch,
  });
