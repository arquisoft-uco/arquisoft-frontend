import { z } from 'zod';
import { LIMITES, textoRequerido } from '../../../shared/validation';

export const observacionRevisionSchema = z.object({
  descripcion: textoRequerido(LIMITES.OBSERVACION_REVISION_ARTEFACTO_MAX),
});

export type ObservacionRevisionValues = z.infer<typeof observacionRevisionSchema>;

export const ETIQUETAS_OBSERVACION_REVISION: Record<keyof ObservacionRevisionValues, string> = {
  descripcion: 'Descripción',
};
