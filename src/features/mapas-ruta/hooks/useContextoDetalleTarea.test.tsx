import { describe, it, expect, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { renderHook } from '../../../test-utils/render';
import { resetAllStores } from '../../../test-utils/store.utils';
import { useContextoDetalleTarea } from './useContextoDetalleTarea';

function leer(state?: unknown, id = 't-1') {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[{ pathname: `/mapas-ruta/tareas/${id}`, state }]}>
      {children}
    </MemoryRouter>
  );
  return renderHook(() => useContextoDetalleTarea(id), { wrapper });
}

describe('useContextoDetalleTarea', () => {
  beforeEach(() => {
    resetAllStores();
  });

  it('lee la search del state, la recupera del snapshot tras perder el state y cae a vacía sin ninguno', () => {
    // Arrange
    const sinNada = leer();
    expect(sinNada.result.current).toEqual({ search: '' });
    leer({ search: '?q=sis&pagina=2' }).unmount();

    // Act
    const recargada = leer();
    const otraTarea = leer(undefined, 't-2');
    const malformada = leer({ search: 'sin-interrogacion' }, 't-3');

    // Assert
    expect(recargada.result.current).toEqual({ search: '?q=sis&pagina=2' });
    expect(otraTarea.result.current).toEqual({ search: '' });
    expect(malformada.result.current).toEqual({ search: '' });
  });
});
