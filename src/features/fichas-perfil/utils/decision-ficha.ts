import type { EvaluacionFichaPerfilEstudiante } from '../models/EvaluacionFichaPerfilEstudiante';

export const ESTADO_FICHA_DECIDIBLE = 'DISPONIBLE_PARA_EVALUACION';

const ESTADOS_EVALUACION_APROBATORIOS = ['APROBADA', 'APROBADA_CON_OBSERVACIONES'];
const ESTADOS_EVALUACION_FINALIZADOS = [...ESTADOS_EVALUACION_APROBATORIOS, 'NO_APROBADA'];

export interface ConteoEvaluacionPorEstado {
  estadoId: string | null;
  nombre: string;
  cantidad: number;
}

export function contarEvaluacionesPorEstado(
  evaluaciones: EvaluacionFichaPerfilEstudiante[],
): ConteoEvaluacionPorEstado[] {
  const conteos = new Map<string | null, ConteoEvaluacionPorEstado>();
  for (const { estadoEvaluacionId, estadoEvaluacionNombre } of evaluaciones) {
    const existente = conteos.get(estadoEvaluacionId);
    if (existente) {
      existente.cantidad += 1;
    } else {
      conteos.set(estadoEvaluacionId, {
        estadoId: estadoEvaluacionId,
        nombre: estadoEvaluacionNombre ?? 'Sin estado',
        cantidad: 1,
      });
    }
  }
  return [...conteos.values()];
}

export function admiteDecision(estadoId?: string): boolean {
  return estadoId === ESTADO_FICHA_DECIDIBLE;
}

export function resumirEvaluacionesParaDecision(evaluaciones: EvaluacionFichaPerfilEstudiante[]): {
  hayFinalizada: boolean;
  hayAprobatoria: boolean;
} {
  const ids = evaluaciones.map((e) => e.estadoEvaluacionId);
  return {
    hayFinalizada: ids.some((id) => id !== null && ESTADOS_EVALUACION_FINALIZADOS.includes(id)),
    hayAprobatoria: ids.some((id) => id !== null && ESTADOS_EVALUACION_APROBATORIOS.includes(id)),
  };
}
