import { z } from 'zod';
import { enteroEntre, LIMITES, textoOpcional } from '../../../shared/validation';

export const planRealSchema = z.object({
  tiempoRealDias: enteroEntre(LIMITES.PLAN_REAL_TIEMPO_DIAS_MIN),
  descripcionReal: textoOpcional(LIMITES.PLAN_REAL_DESCRIPCION_MAX),
});

export type ModificarPlanRealValues = z.infer<typeof planRealSchema>;

export const ETIQUETAS_PLAN_REAL: Record<keyof ModificarPlanRealValues, string> = {
  tiempoRealDias: 'Días reales',
  descripcionReal: 'Descripción',
};

export const CAMPOS_PLAN_REAL = Object.keys(
  ETIQUETAS_PLAN_REAL,
) as (keyof ModificarPlanRealValues)[];

export function comoCampoPlanReal(campo: string): keyof ModificarPlanRealValues | undefined {
  return CAMPOS_PLAN_REAL.find((c) => c === campo);
}
