import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { act, renderHook } from '../../../test-utils/render';
import { useHistorialEstadosFichaCoordinador } from './useHistorialEstadosFichaCoordinador';
import { useResumenFichaCoordinador } from './useResumenFichaCoordinador';

vi.mock('./useHistorialEstadosFichaCoordinador', () => ({
  useHistorialEstadosFichaCoordinador: vi.fn(),
}));

const useHistorial = vi.mocked(useHistorialEstadosFichaCoordinador);

const RESUMEN = {
  id: 'f-1',
  titulo: 'Ficha de prueba',
  estadoId: 'DISPONIBLE_PARA_EVALUACION',
  estadoNombre: 'Disponible para evaluación',
  fechaActualizacion: '2026-01-01T10:00:00',
  asesorId: 'a-1',
  asesorNombre: 'Ana Gómez',
  asesorEmail: 'ana@uco.edu.co',
};

function simularHistorial(data: unknown) {
  useHistorial.mockReturnValue({ data } as ReturnType<typeof useHistorialEstadosFichaCoordinador>);
}

function renderizar(state?: unknown) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[{ pathname: '/fichas-perfil/f-1/estados', state }]}>
        {children}
      </MemoryRouter>
    );
  }
  return renderHook(() => useResumenFichaCoordinador('f-1'), { wrapper: Wrapper });
}

describe('useResumenFichaCoordinador', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sobrepone el estado vigente del historial y el asesor nuevo al resumen de navegación', () => {
    // Arrange
    simularHistorial([
      { id: 'APROBADA', nombre: 'Aprobada', fechaActualizacion: '2026-02-01T10:00:00' },
      {
        id: 'DISPONIBLE_PARA_EVALUACION',
        nombre: 'Disponible para evaluación',
        fechaActualizacion: RESUMEN.fechaActualizacion,
      },
    ]);
    const { result } = renderizar({ resumen: RESUMEN, search: '?q=a' });
    expect(result.current.resumen).toEqual({
      ...RESUMEN,
      estadoId: 'APROBADA',
      estadoNombre: 'Aprobada',
      fechaActualizacion: '2026-02-01T10:00:00',
    });

    // Act
    act(() =>
      result.current.registrarAsesorNuevo({
        id: 'a-2',
        nombre: 'Luis Mora',
        email: 'l@uco.edu.co',
      }),
    );

    // Assert
    expect(result.current.resumen).toMatchObject({
      asesorId: 'a-2',
      asesorNombre: 'Luis Mora',
      asesorEmail: 'l@uco.edu.co',
    });
    expect(result.current.search).toBe('?q=a');
  });

  it('sin historial deja el resumen tal cual, y sin resumen devuelve null', () => {
    // Arrange
    simularHistorial(undefined);

    // Act
    const conResumen = renderizar({ resumen: RESUMEN, search: '' });
    simularHistorial([{ id: 'X', nombre: 'X', fechaActualizacion: '2026-02-01T10:00:00' }]);
    const sinResumen = renderizar();

    // Assert
    expect(conResumen.result.current.resumen).toEqual(RESUMEN);
    expect(sinResumen.result.current.resumen).toBeNull();
  });
});
