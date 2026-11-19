import { z } from 'zod';
import {
  enteroEntre,
  esFechaIsoReal,
  LIMITES,
  textoOpcional,
  textoRequerido,
} from '../../../shared/validation';

export const planEstimadoSchema = z.object({
  tiempoEstimadoDias: enteroEntre(LIMITES.PLAN_ESTIMADO_TIEMPO_DIAS_MIN),
  descripcionEstimado: textoOpcional(LIMITES.PLAN_ESTIMADO_DESCRIPCION_MAX),
});

export const modificarPlanEstimadoSchema = planEstimadoSchema.pick({ descripcionEstimado: true });

export const aportarPlanEstimadoSchema = z.object({
  descripcionEstimado: textoRequerido(LIMITES.PLAN_ESTIMADO_DESCRIPCION_MAX),
});

export type AportarPlanEstimadoValues = z.infer<typeof aportarPlanEstimadoSchema>;

export type ModificarPlanEstimadoValues = z.infer<typeof modificarPlanEstimadoSchema>;

export type PlanEstimadoValues = z.infer<typeof planEstimadoSchema>;

export const ETIQUETAS_PLAN_ESTIMADO: Record<keyof PlanEstimadoValues, string> = {
  tiempoEstimadoDias: 'Días estimados',
  descripcionEstimado: 'Descripción',
};

export const CAMPOS_PLAN_ESTIMADO = Object.keys(
  ETIQUETAS_PLAN_ESTIMADO,
) as (keyof PlanEstimadoValues)[];

export function comoCampoPlanEstimado(campo: string): keyof PlanEstimadoValues | undefined {
  return CAMPOS_PLAN_ESTIMADO.find((c) => c === campo);
}

const MS_POR_DIA = 86_400_000;

function aUtc(iso: string): number {
  const [anio, mes, dia] = iso.split('-').map(Number);
  return Date.UTC(anio, mes - 1, dia);
}

// Misma regla que el backend (ChronoUnit.DAYS.between): diferencia civil sin sumar 1.
export function plazoMapaRutaEnDias(inicioIso: string, finIso: string): number | null {
  if (!esFechaIsoReal(inicioIso) || !esFechaIsoReal(finIso)) return null;
  return Math.round((aUtc(finIso) - aUtc(inicioIso)) / MS_POR_DIA);
}

export function formatearDias(dias: number): string {
  return dias === 1 ? '1 día' : `${dias} días`;
}
