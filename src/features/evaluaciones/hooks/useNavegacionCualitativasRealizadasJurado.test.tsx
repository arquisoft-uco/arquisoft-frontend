import { describe, it, expect } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { renderHook } from '../../../test-utils/render';
import { useNavegacionCualitativasRealizadasJurado } from './useNavegacionCualitativasRealizadasJurado';

function montar(state: unknown) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter
        initialEntries={[{ pathname: '/evaluaciones/ej-1/cualitativas-realizadas', state }]}
      >
        {children}
      </MemoryRouter>
    );
  }
  return renderHook(() => useNavegacionCualitativasRealizadasJurado('ej-1'), {
    wrapper: Wrapper,
  }).result.current;
}

const VALIDO = {
  evaluacionJuradoId: 'ej-1',
  search: '?q=sis',
  evaluacionFinalizada: true,
  resumen: { proyecto: 'Sistema de monitoreo', version: 3 },
};

describe('useNavegacionCualitativasRealizadasJurado', () => {
  it('devuelve la navegación cuando el state es válido y coincide con la ruta', () => {
    // Act & Assert
    expect(montar(VALIDO)).toEqual(VALIDO);
    expect(montar({ ...VALIDO, resumen: null })).toEqual({ ...VALIDO, resumen: null });
  });

  it('asume evaluacionFinalizada false cuando el state no la trae', () => {
    // Arrange
    const { evaluacionFinalizada: _omitida, ...sinCampo } = VALIDO;

    // Act & Assert
    expect(montar(sinCampo)).toEqual({ ...sinCampo, evaluacionFinalizada: false });
  });

  it('devuelve null con state ausente, de otra evaluación o malformado', () => {
    // Act & Assert
    expect(montar(undefined)).toBeNull();
    expect(montar({ ...VALIDO, evaluacionJuradoId: 'otro' })).toBeNull();
    expect(montar({ ...VALIDO, search: 5 })).toBeNull();
    expect(montar({ ...VALIDO, resumen: { proyecto: 'X', version: '1' } })).toBeNull();
  });
});
