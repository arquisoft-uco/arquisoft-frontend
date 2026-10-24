import { describe, it, expect } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { renderHook } from '../../../test-utils/render';
import { useResumenProyectoGrado } from './useResumenProyectoGrado';

function leer(state: unknown, proyectoId = 'p-1') {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[{ pathname: '/proyectos-grado/p-1/asesores', state }]}>
      {children}
    </MemoryRouter>
  );
  return renderHook(() => useResumenProyectoGrado(proyectoId), { wrapper }).result.current;
}

describe('useResumenProyectoGrado', () => {
  it('lee el resumen y la search del state cuando corresponden al proyecto', () => {
    // Act
    const resultado = leer({
      search: '?q=monitoreo',
      resumen: { id: 'p-1', titulo: 'Sistema', estadoId: 'EN_PROCESO', estadoNombre: 'En proceso' },
    });

    // Assert
    expect(resultado).toEqual({
      search: '?q=monitoreo',
      resumen: { id: 'p-1', titulo: 'Sistema', estadoId: 'EN_PROCESO', estadoNombre: 'En proceso' },
    });
  });

  it('devuelve resumen nulo y search vacía si no hay state, es de otro proyecto o no trae search', () => {
    // Arrange
    const deOtroProyecto = { search: '?q=x', resumen: { id: 'p-2', titulo: 'Otro' } };
    const sinSearch = { resumen: { id: 'p-1', titulo: 'Sistema' } };

    // Act / Assert
    expect(leer(undefined)).toEqual({ resumen: null, search: '' });
    expect(leer(deOtroProyecto)).toEqual({ resumen: null, search: '' });
    expect(leer(sinSearch)).toEqual({ resumen: null, search: '' });
  });

  it('ignora el estado que no es string', () => {
    // Act
    const resultado = leer({
      search: '',
      resumen: { id: 'p-1', titulo: 'Sistema', estadoId: 5, estadoNombre: null },
    });

    // Assert
    expect(resultado.resumen).toEqual({ id: 'p-1', titulo: 'Sistema' });
  });
});
