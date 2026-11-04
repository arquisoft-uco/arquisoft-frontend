import { describe, it, expect } from 'vitest';
import { act, renderHook } from '../../test-utils/render';
import { useAvanceSubida } from './useAvanceSubida';

describe('useAvanceSubida', () => {
  it('avanza de fase, reinicia el avance y conserva la última fase para el error', () => {
    // Arrange
    const { result } = renderHook(() => useAvanceSubida());

    // Act
    act(() => result.current.avanzarA('subiendo'));
    act(() => result.current.actualizarPorcentaje(40));

    // Assert
    expect(result.current.fase).toBe('subiendo');
    expect(result.current.porcentaje).toBe(40);

    // Act
    act(() => result.current.reiniciar());

    // Assert
    expect(result.current.fase).toBeNull();
    expect(result.current.porcentaje).toBe(0);
    expect(result.current.faseDelError()).toBe('subiendo');
  });
});
