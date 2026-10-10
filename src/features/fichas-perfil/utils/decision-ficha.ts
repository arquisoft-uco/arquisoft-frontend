import type { EvaluacionFichaPerfilEstudiante } from '../models/EvaluacionFichaPerfilEstudiante';

export const ESTADO_FICHA_DECIDIBLE = 'DISPONIBLE_PARA_EVALUACION';

const ESTADOS_EVALUACION_APROBATORIOS = ['APROBADA', 'APROBADA_CON_OBSERVACIONES'];
const ESTADOS_EVALUACION_FINALIZADOS = [...ESTADOS_EVALUACION_APROBATORIOS, 'NO_APROBADA'];

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
