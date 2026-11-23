import { z } from 'zod';
import type { ZodType, ZodTypeDef } from 'zod';
import { esquemaSearch } from '../../../shared/utils/esquemas-navegacion';
import type { NavegacionDetalleTarea } from '../models/NavegacionDetalleTarea';

export const esquemaContextoDetalleTarea: ZodType<NavegacionDetalleTarea, ZodTypeDef, unknown> =
  z.object({ search: esquemaSearch });
