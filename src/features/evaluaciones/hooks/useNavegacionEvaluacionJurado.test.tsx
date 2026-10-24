import { describe, it, expect } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { renderHook } from '../../../test-utils/render';
import { useNavegacionEvaluacionJurado } from './useNavegacionEvaluacionJurado';

function montar(state: unknown) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[{ pathname: '/evaluaciones/ej-1/cualitativas', state }]}>
        {children}
      </MemoryRouter>
    );
  }
  return renderHook(() => useNavegacionEvaluacionJurado('ej-1'), { wrapper: Wrapper }).result
    .current;
}

const VALIDO = {
  evaluacionJuradoId: 'ej-1',
  evaluacionId: 'e-1',
  jurado: 'Ana Pérez',
  resumen: { id: 'e-1', proyecto: 'Sistema de monitoreo', version: 3 },
  search: '?q=sis',
  searchJurados: '?pagina=2',
};

describe('useNavegacionEvaluacionJurado', () => {
  it('devuelve la navegación cuando el state es válido y coincide con la ruta', () => {
    // Act & Assert
    expect(montar(VALIDO)).toEqual(VALIDO);
    expect(montar({ ...VALIDO, resumen: null })).toEqual({ ...VALIDO, resumen: null });
  });

  it('devuelve null con state ausente, de otro jurado o malformado', () => {
    // Act & Assert
    expect(montar(undefined)).toBeNull();
    expect(montar({ ...VALIDO, evaluacionJuradoId: 'otro' })).toBeNull();
    expect(montar({ ...VALIDO, jurado: 5 })).toBeNull();
    expect(montar({ ...VALIDO, searchJurados: undefined })).toBeNull();
    expect(montar({ ...VALIDO, resumen: { id: 'e-1', proyecto: 'X', version: '1' } })).toBeNull();
  });
});
