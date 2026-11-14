import { describe, it, expect, vi } from 'vitest';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../../test-utils/render';
import { useHistorialEstadosProyectoGrado } from '../hooks/useHistorialEstadosProyectoGrado';
import PestanaEstados from './PestanaEstados';

vi.mock('../hooks/useHistorialEstadosProyectoGrado', () => ({
  useHistorialEstadosProyectoGrado: vi.fn(),
}));

type Hook = ReturnType<typeof useHistorialEstadosProyectoGrado>;

function mockearHook(parcial: Partial<Record<keyof Hook, unknown>>) {
  vi.mocked(useHistorialEstadosProyectoGrado).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...parcial,
  } as Hook);
}

describe('PestanaEstados', () => {
  it('consulta el historial con el id de la ruta y lo muestra', () => {
    // Arrange
    mockearHook({
      data: [
        {
          id: 'h-1',
          estado: { id: 'EN_PROCESO', nombre: 'En proceso' },
          fechaActualizacion: '2026-03-01T10:00:00Z',
          motivo: null,
        },
      ],
    });

    // Act
    render(
      <Routes>
        <Route path="/proyectos-grado/:id/estados" element={<PestanaEstados />} />
      </Routes>,
      { initialPath: '/proyectos-grado/p-9/estados' },
    );

    // Assert
    expect(useHistorialEstadosProyectoGrado).toHaveBeenCalledWith('p-9');
    expect(screen.getByText('En proceso')).toBeInTheDocument();
  });
});
