import { describe, it, expect } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { renderHook } from '../../../test-utils/render';
import { useNavegacionCualitativasAsesor } from './useNavegacionCualitativasAsesor';

function montar(state: unknown) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter
        initialEntries={[{ pathname: '/evaluaciones/ea-1/cualitativas-asesor', state }]}
      >
        {children}
      </MemoryRouter>
    );
  }
  return renderHook(() => useNavegacionCualitativasAsesor('ea-1'), { wrapper: Wrapper }).result
    .current;
}

const VALIDO = {
  evaluacionAsesorId: 'ea-1',
  search: '?q=sis',
  resumen: { proyecto: 'Sistema de monitoreo', version: 3 },
};

describe('useNavegacionCualitativasAsesor', () => {
  it('devuelve la navegación cuando el state es válido y coincide con la ruta', () => {
    // Act & Assert
    expect(montar(VALIDO)).toEqual(VALIDO);
    expect(montar({ ...VALIDO, resumen: null })).toEqual({ ...VALIDO, resumen: null });
  });

  it('devuelve null con state ausente, de otra evaluación o malformado', () => {
    // Act & Assert
    expect(montar(undefined)).toBeNull();
    expect(montar({ ...VALIDO, evaluacionAsesorId: 'otro' })).toBeNull();
    expect(montar({ ...VALIDO, search: 5 })).toBeNull();
    expect(montar({ ...VALIDO, resumen: { proyecto: 'X', version: '1' } })).toBeNull();
  });
});
