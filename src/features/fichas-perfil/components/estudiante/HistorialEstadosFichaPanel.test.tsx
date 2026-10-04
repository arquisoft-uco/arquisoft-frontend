import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import { useEstadosFichaPerfilEstudiante } from '../../hooks/useEstadosFichaPerfilEstudiante';
import HistorialEstadosFichaPanel from './HistorialEstadosFichaPanel';

vi.mock('../../hooks/useEstadosFichaPerfilEstudiante', () => ({
  useEstadosFichaPerfilEstudiante: vi.fn(),
}));

function conEstado(parcial: Partial<ReturnType<typeof useEstadosFichaPerfilEstudiante>>) {
  vi.mocked(useEstadosFichaPerfilEstudiante).mockReturnValue({
    historial: [],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    fichaPerfilIdDisponible: true,
    ...parcial,
  });
}

describe('HistorialEstadosFichaPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el aviso de no disponible cuando falta el id de la ficha', () => {
    // Arrange
    conEstado({ fichaPerfilIdDisponible: false });

    // Act
    render(<HistorialEstadosFichaPanel />);

    // Assert
    expect(
      screen.getByRole('note', {
        name: 'No disponible: historial de estados de tu ficha de perfil',
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('muestra el estado de carga', () => {
    // Arrange
    conEstado({ isLoading: true });

    // Act
    render(<HistorialEstadosFichaPanel />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando historial de estados');
  });

  it('muestra una alerta cuando falla la consulta', () => {
    // Arrange
    conEstado({ isError: true, error: new Error('fallo') });

    // Act
    render(<HistorialEstadosFichaPanel />);

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('vuelve a consultar el historial al pulsar «Reintentar» tras un error', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    conEstado({ isError: true, error: new Error('fallo'), refetch });
    render(<HistorialEstadosFichaPanel />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('muestra el texto de vacío cuando no hay estados', () => {
    // Arrange
    conEstado({ historial: [] });

    // Act
    render(<HistorialEstadosFichaPanel />);

    // Assert
    expect(screen.getByText('Tu ficha aún no tiene estados registrados.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('lista los estados en el orden recibido y marca solo el primero como actual', () => {
    // Arrange
    conEstado({
      historial: [
        { id: 'REVISION', nombre: 'En revision', fechaActualizacion: '2026-09-02T10:00:00Z' },
        {
          id: 'EN_CONSTRUCCION',
          nombre: 'En construccion',
          fechaActualizacion: '2026-09-01T10:00:00Z',
        },
      ],
    });

    // Act
    render(<HistorialEstadosFichaPanel />);

    // Assert
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText('En revision')).toBeInTheDocument();
    expect(within(items[1]).getByText('En construccion')).toBeInTheDocument();
    expect(screen.getAllByText('Actual')).toHaveLength(1);
    expect(within(items[0]).getByText('Actual')).toBeInTheDocument();
  });
});
