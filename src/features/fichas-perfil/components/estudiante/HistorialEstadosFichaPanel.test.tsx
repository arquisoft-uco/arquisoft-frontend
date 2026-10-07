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
    cargado: true,
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
    conEstado({ isLoading: true, cargado: false });

    // Act
    render(<HistorialEstadosFichaPanel />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando historial de estados…');
    expect(screen.queryByText(/aún no tiene estados/)).not.toBeInTheDocument();
  });

  it('con la consulta pausada (sin datos cargados) no pinta el vacío', () => {
    // Arrange
    conEstado({ historial: [], cargado: false, isLoading: false });

    // Act
    render(<HistorialEstadosFichaPanel />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText(/aún no tiene estados/)).not.toBeInTheDocument();
  });

  it('muestra una alerta con el mensaje del backend como detalle cuando falla la consulta', () => {
    // Arrange
    conEstado({
      isError: true,
      cargado: false,
      error: Object.assign(new Error('fallo'), {
        isAxiosError: true,
        response: { status: 500, data: { message: 'Servicio caído.' } },
      }),
    });

    // Act
    render(<HistorialEstadosFichaPanel />);

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudo cargar el historial de estados',
    );
    expect(screen.getByText('Servicio caído.')).toBeInTheDocument();
  });

  it('vuelve a consultar el historial al pulsar «Reintentar» tras un error', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    conEstado({ isError: true, cargado: false, error: new Error('fallo'), refetch });
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
    expect(screen.getByText('Tu ficha aún no tiene estados registrados')).toBeInTheDocument();
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
    expect(
      screen.getByRole('list', { name: 'Historial de estados de la ficha' }),
    ).toBeInTheDocument();
    expect(items[0].querySelector('time')).toHaveAttribute('datetime', '2026-09-02T10:00:00Z');
  });
});
