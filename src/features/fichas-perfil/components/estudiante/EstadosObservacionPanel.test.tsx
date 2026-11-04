import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { useEstadosObservacionRevision } from '../../hooks/useEstadosObservacionRevision';
import EstadosObservacionPanel from './EstadosObservacionPanel';

vi.mock('../../hooks/useEstadosObservacionRevision', () => ({
  useEstadosObservacionRevision: vi.fn(),
}));

type Consulta = ReturnType<typeof useEstadosObservacionRevision>;

function conConsulta(parcial: Partial<Record<keyof Consulta, unknown>>) {
  vi.mocked(useEstadosObservacionRevision).mockReturnValue({
    data: [],
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...parcial,
  } as Consulta);
}

describe('EstadosObservacionPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el estado de carga mientras la consulta está pendiente', () => {
    // Arrange
    conConsulta({ data: undefined, isPending: true });

    // Act
    render(<EstadosObservacionPanel />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('Aún no hay estados de observación')).not.toBeInTheDocument();
  });

  it('muestra el vacío cuando el catálogo no trae estados', () => {
    // Arrange
    conConsulta({ data: [] });

    // Act
    render(<EstadosObservacionPanel />);

    // Assert
    expect(screen.getByText('Aún no hay estados de observación')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra la alerta con el detalle del backend y «Reintentar» vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    conConsulta({
      data: undefined,
      isError: true,
      refetch,
      error: Object.assign(new Error('fallo'), {
        isAxiosError: true,
        response: { status: 500, data: { message: 'Servicio caído.' } },
      }),
    });
    render(<EstadosObservacionPanel />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar los estados de observación',
    );
    expect(screen.getByText('Servicio caído.')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('lista cada estado con su nombre y su descripción', () => {
    // Arrange
    conConsulta({
      data: [
        { id: 'PENDIENTE', nombre: 'Pendiente', descripcion: 'Aún no se atiende' },
        { id: 'CERRADO', nombre: 'Cerrado', descripcion: 'Ya se atendió' },
      ],
    });

    // Act
    render(<EstadosObservacionPanel />);

    // Assert
    expect(screen.getAllByText('Pendiente').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Aún no se atiende').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Cerrado').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ya se atendió').length).toBeGreaterThan(0);
  });
});
