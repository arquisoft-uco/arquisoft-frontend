import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { renderHook } from '../../../test-utils/render';
import { resetAllStores } from '../../../test-utils/store.utils';
import { useHistorialEstadosFichaAsesor } from './useHistorialEstadosFichaAsesor';
import { useResumenFichaAsesor } from './useResumenFichaAsesor';

vi.mock('./useHistorialEstadosFichaAsesor', () => ({
  useHistorialEstadosFichaAsesor: vi.fn(),
}));

const useHistorial = vi.mocked(useHistorialEstadosFichaAsesor);

const RESUMEN = {
  id: 'f-1',
  titulo: 'Ficha de prueba',
  estadoId: 'EN_CONSTRUCCION',
  estadoNombre: 'En Construccion',
  fechaActualizacion: '2026-01-01T10:00:00',
  asesorId: 'a-1',
  asesorNombre: 'Ana Gómez',
  asesorEmail: 'ana@uco.edu.co',
};

function simularHistorial(data: unknown) {
  useHistorial.mockReturnValue({ data } as ReturnType<typeof useHistorialEstadosFichaAsesor>);
}

function renderizar(state?: unknown) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[{ pathname: '/fichas-perfil/f-1/estados', state }]}>
        {children}
      </MemoryRouter>
    );
  }
  return renderHook(() => useResumenFichaAsesor('f-1'), { wrapper: Wrapper });
}

describe('useResumenFichaAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetAllStores();
  });

  it('sobrepone estado y fecha del primer elemento del historial al resumen de navegación', () => {
    // Arrange
    simularHistorial([
      { id: 'DESCARTADA', nombre: 'Descartada', fechaActualizacion: '2026-02-01T10:00:00' },
      {
        id: 'EN_CONSTRUCCION',
        nombre: 'En Construccion',
        fechaActualizacion: RESUMEN.fechaActualizacion,
      },
    ]);

    // Act
    const { result } = renderizar({ resumen: RESUMEN, search: '?q=a' });

    // Assert
    expect(result.current).toEqual({
      resumen: {
        ...RESUMEN,
        estadoId: 'DESCARTADA',
        estadoNombre: 'Descartada',
        fechaActualizacion: '2026-02-01T10:00:00',
      },
      search: '?q=a',
    });
  });

  it('sin historial devuelve el resumen tal cual, y sin state ni snapshot devuelve null', () => {
    // Arrange
    simularHistorial([{ id: 'X', nombre: 'X', fechaActualizacion: '2026-02-01T10:00:00' }]);

    // Act
    const sinResumen = renderizar();
    simularHistorial(undefined);
    const conResumen = renderizar({ resumen: RESUMEN, search: '' });

    // Assert
    expect(conResumen.result.current.resumen).toEqual(RESUMEN);
    expect(sinResumen.result.current.resumen).toBeNull();
  });

  it('reescribe el snapshot con el estado nuevo del historial conservando el asesor', () => {
    // Arrange
    simularHistorial([
      { id: 'DESCARTADA', nombre: 'Descartada', fechaActualizacion: '2026-02-01T10:00:00' },
    ]);
    renderizar({ resumen: RESUMEN, search: '?q=a' }).unmount();
    simularHistorial(undefined);

    // Act
    const { result } = renderizar();

    // Assert
    expect(result.current).toEqual({
      resumen: {
        ...RESUMEN,
        estadoId: 'DESCARTADA',
        estadoNombre: 'Descartada',
        fechaActualizacion: '2026-02-01T10:00:00',
      },
      search: '?q=a',
    });
  });
});
