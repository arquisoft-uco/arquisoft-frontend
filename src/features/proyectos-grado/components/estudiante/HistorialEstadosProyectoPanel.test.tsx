import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import HistorialEstadosProyectoPanel from './HistorialEstadosProyectoPanel';
import { useEstadosProyectoGrado } from '../../hooks/useEstadosProyectoGrado';

vi.mock('../../hooks/useEstadosProyectoGrado', () => ({ useEstadosProyectoGrado: vi.fn() }));

type Hook = ReturnType<typeof useEstadosProyectoGrado>;

function mockearHook(parcial: Partial<Record<keyof Hook, unknown>>) {
  vi.mocked(useEstadosProyectoGrado).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...parcial,
  } as Hook);
}

describe('HistorialEstadosProyectoPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cargando muestra el esqueleto', () => {
    // Arrange
    mockearHook({ isLoading: true });

    // Act
    render(<HistorialEstadosProyectoPanel proyectoGradoId="p-1" />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('sin estados muestra el vacío', () => {
    // Arrange
    mockearHook({ data: [] });

    // Act
    render(<HistorialEstadosProyectoPanel proyectoGradoId="p-1" />);

    // Assert
    expect(screen.getByText('Este proyecto aún no tiene estados registrados')).toBeInTheDocument();
  });

  it('con error muestra el ErrorState y Reintentar vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    mockearHook({ isError: true, refetch });
    render(<HistorialEstadosProyectoPanel proyectoGradoId="p-1" />);

    // Act
    await user.click(screen.getByRole('button', { name: /Reintentar/ }));

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('con datos muestra los estados del backend y un solo Actual', () => {
    // Arrange
    mockearHook({
      data: [
        {
          id: 'h-2',
          estado: { id: 'EN_CURSO', nombre: 'En curso' },
          fechaActualizacion: '2026-03-02T10:00:00Z',
        },
        {
          id: 'h-1',
          estado: { id: 'INICIADO', nombre: 'Iniciado' },
          fechaActualizacion: '2026-03-01T10:00:00Z',
        },
      ],
    });

    // Act
    render(<HistorialEstadosProyectoPanel proyectoGradoId="p-1" />);

    // Assert
    expect(screen.getByText('En curso')).toBeInTheDocument();
    expect(screen.getByText('Iniciado')).toBeInTheDocument();
    expect(screen.getAllByText('Actual')).toHaveLength(1);
  });
});
