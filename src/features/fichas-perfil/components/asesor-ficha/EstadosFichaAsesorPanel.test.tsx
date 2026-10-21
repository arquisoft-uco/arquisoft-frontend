import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import { useHistorialEstadosFichaAsesor } from '../../hooks/useHistorialEstadosFichaAsesor';
import EstadosFichaAsesorPanel from './EstadosFichaAsesorPanel';

vi.mock('../../hooks/useHistorialEstadosFichaAsesor', () => ({
  useHistorialEstadosFichaAsesor: vi.fn(),
}));
vi.mock('../EstadosFichaPanel', () => ({
  default: ({ estadoActual }: { estadoActual: { id: string } }) => (
    <div>Panel cambiar estado desde {estadoActual.id}</div>
  ),
}));

const useHistorial = vi.mocked(useHistorialEstadosFichaAsesor);

type Resultado = ReturnType<typeof useHistorialEstadosFichaAsesor>;

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

describe('EstadosFichaAsesorPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mientras carga muestra el estado de carga y no el vacío', () => {
    // Arrange
    simular({ isLoading: true });

    // Act
    render(<EstadosFichaAsesorPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(
      screen.queryByText('Esta ficha aún no tiene estados registrados'),
    ).not.toBeInTheDocument();
  });

  it('sin estados muestra el vacío y ninguna alerta', () => {
    // Arrange
    simular({ data: [] });

    // Act
    render(<EstadosFichaAsesorPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getByText('Esta ficha aún no tiene estados registrados')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('con error muestra la alerta y «Reintentar» vuelve a consultar', async () => {
    // Arrange
    const refetch = vi.fn();
    simular({ isError: true, error: new Error('falla'), refetch });
    const user = userEvent.setup();

    // Act
    render(<EstadosFichaAsesorPanel fichaPerfilId="f-1" />);
    await user.click(screen.getByRole('button', { name: /Reintentar/ }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudo cargar el historial de estados',
    );
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('sin historial o con error no monta el panel de cambio de estado', () => {
    // Arrange
    simular({ data: [] });

    // Act
    const { unmount } = render(<EstadosFichaAsesorPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.queryByText(/Panel cambiar estado/)).not.toBeInTheDocument();
    unmount();

    // Arrange
    simular({ isError: true, error: new Error('falla') });

    // Act
    render(<EstadosFichaAsesorPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.queryByText(/Panel cambiar estado/)).not.toBeInTheDocument();
  });

  it('con datos lista los estados en orden, con un solo «Actual» en el primero, y «Cambiar estado» después', () => {
    // Arrange
    simular({
      data: [
        { id: 'e-3', nombre: 'Aprobada', fechaActualizacion: '2026-03-01T10:00:00' },
        { id: 'e-1', nombre: 'Creada', fechaActualizacion: '2026-01-01T10:00:00' },
      ],
    });

    // Act
    render(<EstadosFichaAsesorPanel fichaPerfilId="f-1" />);

    // Assert
    const lista = screen.getByRole('list', { name: 'Historial de estados de la ficha' });
    const pasos = within(lista).getAllByRole('listitem');
    expect(pasos).toHaveLength(2);
    expect(within(pasos[0]).getByText('Aprobada')).toBeInTheDocument();
    expect(within(pasos[0]).getByText('Actual')).toBeInTheDocument();
    expect(within(pasos[1]).getByText('Creada')).toBeInTheDocument();
    expect(screen.getAllByText('Actual')).toHaveLength(1);
    const panel = screen.getByText('Panel cambiar estado desde e-3');
    expect(lista.compareDocumentPosition(panel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
