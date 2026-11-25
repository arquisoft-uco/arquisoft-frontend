import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '../../../test-utils/render';
import type { EvaluacionFichaPerfil } from '../models/fichas-perfil';
import { useEvaluacionFicha } from './useEvaluacionFicha';
import { useEvaluacionDescartada } from './useEvaluacionDescartada';

vi.mock('./useEvaluacionFicha', () => ({ useEvaluacionFicha: vi.fn() }));

function evaluacion(id: string, estadoEvaluacionId: string | null): EvaluacionFichaPerfil {
  return {
    id,
    fichaPerfilId: 'f-1',
    fechaCreacion: '2026-10-01',
    estadoEvaluacionId,
    estadoEvaluacionNombre: null,
  };
}

function simular(data: EvaluacionFichaPerfil[] | undefined, isPending = false) {
  vi.mocked(useEvaluacionFicha).mockReturnValue({ data, isPending } as ReturnType<
    typeof useEvaluacionFicha
  >);
}

describe('useEvaluacionDescartada', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('es true solo cuando la evaluación vigente (la última) está descartada', () => {
    // Arrange
    simular([evaluacion('ev-1', 'APROBADA'), evaluacion('ev-2', 'DESCARTADA')]);

    // Act
    const { result } = renderHook(() => useEvaluacionDescartada('f-1'));

    // Assert
    expect(useEvaluacionFicha).toHaveBeenCalledWith('f-1');
    expect(result.current).toEqual({ descartada: true, cargando: false });
  });

  it('es false si la descartada es una anterior, si no hay evaluaciones y mientras carga', () => {
    // Arrange
    simular([evaluacion('ev-1', 'DESCARTADA'), evaluacion('ev-2', 'EN_EVALUACION')]);

    // Act
    const anterior = renderHook(() => useEvaluacionDescartada('f-1'));

    // Assert
    expect(anterior.result.current.descartada).toBe(false);

    // Arrange
    simular([]);

    // Act
    const vacia = renderHook(() => useEvaluacionDescartada('f-1'));

    // Assert
    expect(vacia.result.current.descartada).toBe(false);

    // Arrange
    simular(undefined, true);

    // Act
    const cargando = renderHook(() => useEvaluacionDescartada('f-1'));

    // Assert
    expect(cargando.result.current).toEqual({ descartada: false, cargando: true });
  });
});
