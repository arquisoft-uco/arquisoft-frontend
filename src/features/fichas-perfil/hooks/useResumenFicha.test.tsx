import { describe, it, expect } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter, useNavigate } from 'react-router';
import { act, renderHook } from '../../../test-utils/render';
import { useResumenFicha } from './useResumenFicha';

function crearWrapper(state?: unknown) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[{ pathname: '/fichas-perfil/f-1/items', state }]}>
        {children}
      </MemoryRouter>
    );
  };
}

function renderizar(state?: unknown) {
  return renderHook(() => ({ detalle: useResumenFicha('f-1'), navigate: useNavigate() }), {
    wrapper: crearWrapper(state),
  });
}

const RESUMEN = {
  id: 'f-1',
  titulo: 'Ficha de prueba',
  estadoId: 'e-1',
  estadoNombre: 'Aprobada',
  fechaActualizacion: '2026-10-02T10:00:00Z',
  asesorNombre: 'Ana Gómez',
  asesorEmail: 'ana@uco.edu.co',
};

describe('useResumenFicha', () => {
  it('lee el resumen y la search del state y los conserva cuando el state se pierde al cambiar de pestaña', () => {
    // Arrange
    const { result } = renderizar({ resumen: RESUMEN, search: '?q=ana&pagina=2' });
    expect(result.current.detalle).toEqual({ resumen: RESUMEN, search: '?q=ana&pagina=2' });

    // Act
    act(() => result.current.navigate('/fichas-perfil/f-1/estados'));

    // Assert
    expect(result.current.detalle.resumen).toEqual(RESUMEN);
    expect(result.current.detalle.search).toBe('?q=ana&pagina=2');
  });

  it('sin state devuelve resumen nulo y search vacía', () => {
    // Act
    const { result } = renderizar();

    // Assert
    expect(result.current.detalle).toEqual({ resumen: null, search: '' });
  });

  it('ignora un state de otra ficha o malformado', () => {
    // Act
    const ajeno = renderizar({ resumen: { ...RESUMEN, id: 'otra' }, search: '' });
    const sinSearch = renderizar({ resumen: RESUMEN });
    const sinTitulo = renderizar({ resumen: { id: 'f-1' }, search: '' });
    const cadena = renderizar('texto');

    // Assert
    for (const { result } of [ajeno, sinSearch, sinTitulo, cadena]) {
      expect(result.current.detalle).toEqual({ resumen: null, search: '' });
    }
  });

  it('descarta los campos opcionales que no son cadenas', () => {
    // Act
    const { result } = renderizar({
      resumen: { id: 'f-1', titulo: 'T', estadoId: 5, asesorNombre: null },
      search: '',
    });

    // Assert
    expect(result.current.detalle.resumen).toEqual({
      id: 'f-1',
      titulo: 'T',
      estadoId: undefined,
      estadoNombre: undefined,
      fechaActualizacion: undefined,
      asesorNombre: undefined,
      asesorEmail: undefined,
    });
  });
});
