import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../../test-utils/render';
import HistorialEstadosProyectoPanel from './HistorialEstadosProyectoPanel';
import { useEstadosProyectoGrado } from '../../hooks/useEstadosProyectoGrado';

vi.mock('../../hooks/useEstadosProyectoGrado', () => ({ useEstadosProyectoGrado: vi.fn() }));

type Hook = ReturnType<typeof useEstadosProyectoGrado>;

describe('HistorialEstadosProyectoPanel', () => {
  it('consulta el historial del estudiante con su proyecto y lo pinta', () => {
    // Arrange
    vi.mocked(useEstadosProyectoGrado).mockReturnValue({
      data: [
        {
          id: 'h-1',
          estado: { id: 'INICIADO', nombre: 'Iniciado' },
          fechaActualizacion: '2026-03-01T10:00:00Z',
          motivo: null,
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as Partial<Record<keyof Hook, unknown>> as Hook);

    // Act
    render(<HistorialEstadosProyectoPanel proyectoGradoId="p-1" />);

    // Assert
    expect(useEstadosProyectoGrado).toHaveBeenCalledWith('p-1');
    expect(screen.getByText('Iniciado')).toBeInTheDocument();
  });
});
