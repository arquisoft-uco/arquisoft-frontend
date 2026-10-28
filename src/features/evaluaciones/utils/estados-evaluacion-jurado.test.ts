import { describe, it, expect } from 'vitest';
import type { EstadoEvaluacionJurado } from '../models/EstadoEvaluacionJurado';
import { textoEvaluacionFaltante } from './estados-evaluacion-jurado';

const PENDIENTE: EstadoEvaluacionJurado = {
  id: 'PENDIENTE_POR_EVALUAR',
  nombre: 'Pendiente por evaluar',
};
const EVALUADA: EstadoEvaluacionJurado = { id: 'EVALUADA', nombre: 'Evaluada' };

function faltante(
  estado: EstadoEvaluacionJurado,
  tieneEvaluacionesCualitativas: boolean,
  tieneEvaluacionesCuantitativas: boolean,
) {
  return textoEvaluacionFaltante({
    estado,
    tieneEvaluacionesCualitativas,
    tieneEvaluacionesCuantitativas,
  });
}

describe('textoEvaluacionFaltante', () => {
  it('indica qué falta solo en estado pendiente y nada si está evaluada o completa', () => {
    // Act & Assert
    expect(faltante(PENDIENTE, false, false)).toBe('Faltan ambas');
    expect(faltante(PENDIENTE, true, false)).toBe('Falta la cuantitativa');
    expect(faltante(PENDIENTE, false, true)).toBe('Falta la cualitativa');
    expect(faltante(PENDIENTE, true, true)).toBeNull();
    expect(faltante(EVALUADA, false, false)).toBeNull();
  });
});
