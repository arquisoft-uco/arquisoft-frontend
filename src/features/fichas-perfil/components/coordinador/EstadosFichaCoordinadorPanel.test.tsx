import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import { useHistorialEstadosFichaCoordinador } from '../../hooks/useHistorialEstadosFichaCoordinador';
import EstadosFichaCoordinadorPanel from './EstadosFichaCoordinadorPanel';

vi.mock('../../hooks/useHistorialEstadosFichaCoordinador', () => ({
  useHistorialEstadosFichaCoordinador: vi.fn(),
}));

const useHistorial = vi.mocked(useHistorialEstadosFichaCoordinador);

type Resultado = ReturnType<typeof useHistorialEstadosFichaCoordinador>;

function simular(parcial: Partial<Resultado>) {
  useHistorial.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...parcial,
  } as Resultado);
}

describe('EstadosFichaCoordinadorPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta el historial de la ficha y mientras carga muestra el estado de carga', () => {
    // Arrange
    simular({ isLoading: true });

    // Act
    render(<EstadosFichaCoordinadorPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(
      screen.queryByText('Esta ficha aún no tiene estados registrados'),
    ).not.toBeInTheDocument();
    expect(useHistorial).toHaveBeenCalledWith('f-1');
  });

  it('sin estados muestra el vacío con su siguiente paso y ninguna alerta', () => {
    // Arrange
    simular({ data: [] });

    // Act
    render(<EstadosFichaCoordinadorPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getByText('Esta ficha aún no tiene estados registrados')).toBeInTheDocument();
    expect(
      screen.getByText('Aquí aparecerán los estados de la ficha a medida que avance.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('con error muestra la alerta y «Reintentar» vuelve a consultar', async () => {
    // Arrange
    const refetch = vi.fn();
    simular({ isError: true, error: new Error('falla'), refetch });
    const user = userEvent.setup();

    // Act
    render(<EstadosFichaCoordinadorPanel fichaPerfilId="f-1" />);
    await user.click(screen.getByRole('button', { name: /Reintentar/ }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudo cargar el historial de estados',
    );
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('con datos lista los estados en orden, marca «Actual» solo el primero y no ofrece acciones', () => {
    // Arrange
    simular({
      data: [
        { id: 'e-3', nombre: 'Aprobada', fechaActualizacion: '2026-03-01T10:00:00' },
        { id: 'e-1', nombre: 'Creada', fechaActualizacion: '2026-01-01T10:00:00' },
      ],
    });

    // Act
    render(<EstadosFichaCoordinadorPanel fichaPerfilId="f-1" />);

    // Assert
    const lista = screen.getByRole('list', { name: 'Historial de estados de la ficha' });
    const pasos = within(lista).getAllByRole('listitem');
    expect(pasos).toHaveLength(2);
    expect(within(pasos[0]).getByText('Aprobada')).toBeInTheDocument();
    expect(within(pasos[0]).getByText('Actual')).toBeInTheDocument();
    expect(within(pasos[1]).getByText('Creada')).toBeInTheDocument();
    expect(screen.getAllByText('Actual')).toHaveLength(1);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
