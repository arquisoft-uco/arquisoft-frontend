import { describe, it, expect } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { renderHook } from '../../../test-utils/render';
import { useResumenEvaluacion } from './useResumenEvaluacion';

function montar(state: unknown) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[{ pathname: '/evaluaciones/e-1/jurados', state }]}>
        {children}
      </MemoryRouter>
    );
  }
  return renderHook(() => useResumenEvaluacion('e-1'), { wrapper: Wrapper }).result.current;
}

describe('useResumenEvaluacion', () => {
  it('devuelve el resumen y el search cuando el state es válido y coincide con la ruta', () => {
    // Act
    const resultado = montar({
      resumen: { id: 'e-1', proyecto: 'Sistema de monitoreo', version: 3 },
      search: '?q=sis&pagina=2',
    });

    // Assert
    expect(resultado).toEqual({
      resumen: { id: 'e-1', proyecto: 'Sistema de monitoreo', version: 3 },
      search: '?q=sis&pagina=2',
    });
  });

  it('devuelve null y cadena vacía con state ausente, de otra evaluación o malformado', () => {
    // Arrange
    const vacio = { resumen: null, search: '' };

    // Act & Assert
    expect(montar(undefined)).toEqual(vacio);
    expect(montar({ resumen: { id: 'otra', proyecto: 'X', version: 1 }, search: '' })).toEqual(
      vacio,
    );
    expect(montar({ resumen: { id: 'e-1', proyecto: 'X', version: '1' }, search: '' })).toEqual(
      vacio,
    );
    expect(montar({ resumen: { id: 'e-1', proyecto: 'X', version: 1 }, search: 5 })).toEqual(vacio);
  });
});
