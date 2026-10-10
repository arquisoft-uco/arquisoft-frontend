import { describe, it, expect } from 'vitest';
import type { EvaluacionFichaPerfilEstudiante } from '../models/EvaluacionFichaPerfilEstudiante';
import { admiteDecision, resumirEvaluacionesParaDecision } from './decision-ficha';

function evaluacion(estadoEvaluacionId: string | null): EvaluacionFichaPerfilEstudiante {
  return {
    id: `ev-${estadoEvaluacionId}`,
    fichaPerfilId: 'f-1',
    fechaCreacion: '2026-10-01T10:00:00',
    estadoEvaluacionId,
    estadoEvaluacionNombre: null,
    representante: { id: 'r-1', nombre: 'Rep' },
  };
}

describe('decision-ficha', () => {
  it('admiteDecision solo con la ficha disponible para evaluación', () => {
    // Assert
    expect(admiteDecision('DISPONIBLE_PARA_EVALUACION')).toBe(true);
    expect(admiteDecision('APROBADA')).toBe(false);
    expect(admiteDecision(undefined)).toBe(false);
  });

  it('resume las evaluaciones en finalizada y aprobatoria', () => {
    // Assert
    expect(resumirEvaluacionesParaDecision([])).toEqual({
      hayFinalizada: false,
      hayAprobatoria: false,
    });
    expect(
      resumirEvaluacionesParaDecision([
        evaluacion('EN_EVALUACION'),
        evaluacion('DESCARTADA'),
        evaluacion(null),
      ]),
    ).toEqual({ hayFinalizada: false, hayAprobatoria: false });
    expect(resumirEvaluacionesParaDecision([evaluacion('NO_APROBADA')])).toEqual({
      hayFinalizada: true,
      hayAprobatoria: false,
    });
    expect(resumirEvaluacionesParaDecision([evaluacion('APROBADA')])).toEqual({
      hayFinalizada: true,
      hayAprobatoria: true,
    });
    expect(resumirEvaluacionesParaDecision([evaluacion('APROBADA_CON_OBSERVACIONES')])).toEqual({
      hayFinalizada: true,
      hayAprobatoria: true,
    });
  });
});
