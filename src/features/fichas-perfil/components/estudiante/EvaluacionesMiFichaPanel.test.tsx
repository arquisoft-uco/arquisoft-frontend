import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import { useEvaluacionesMiFicha } from '../../hooks/useEvaluacionesMiFicha';
import EvaluacionesMiFichaPanel from './EvaluacionesMiFichaPanel';

vi.mock('../../hooks/useEvaluacionesMiFicha', () => ({ useEvaluacionesMiFicha: vi.fn() }));

function conEvaluaciones(parcial: Partial<ReturnType<typeof useEvaluacionesMiFicha>>) {
  vi.mocked(useEvaluacionesMiFicha).mockReturnValue({
    evaluaciones: [],
    isLoading: false,
    cargado: true,
    isError: false,
    error: null,
    refetch: vi.fn(),
    fichaPerfilIdDisponible: true,
    ...parcial,
  });
}

describe('EvaluacionesMiFichaPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el aviso de no disponible cuando falta la ficha activa', () => {
    // Arrange
    conEvaluaciones({ fichaPerfilIdDisponible: false });

    // Act
    render(<EvaluacionesMiFichaPanel />);

    // Assert
    expect(
      screen.getByRole('note', { name: 'No disponible: evaluaciones de tu ficha de perfil' }),
    ).toBeInTheDocument();
  });

  it('muestra el estado de carga y no pinta el vacío', () => {
    // Arrange
    conEvaluaciones({ isLoading: true, cargado: false });

    // Act
    render(<EvaluacionesMiFichaPanel />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando evaluaciones…');
    expect(screen.queryByText('Tu ficha aún no tiene evaluaciones')).not.toBeInTheDocument();
  });

  it('ante un error muestra la alerta y «Reintentar» vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    conEvaluaciones({ isError: true, cargado: false, error: new Error('fallo'), refetch });
    render(<EvaluacionesMiFichaPanel />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar las evaluaciones');
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('sin evaluaciones muestra el texto de vacío', () => {
    // Arrange
    conEvaluaciones({ evaluaciones: [] });

    // Act
    render(<EvaluacionesMiFichaPanel />);

    // Assert
    expect(screen.getByText('Tu ficha aún no tiene evaluaciones')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('lista cada evaluación con estado, fecha y representante, incluida una descartada y una sin estado', () => {
    // Arrange
    conEvaluaciones({
      evaluaciones: [
        {
          id: 'ev-2',
          fichaPerfilId: 'f-1',
          fechaCreacion: '2026-09-05T10:00:00Z',
          estadoEvaluacionId: 'DESCARTADA',
          estadoEvaluacionNombre: 'Descartada',
          representante: { id: 'r-1', nombre: 'Rosa Gil' },
        },
        {
          id: 'ev-1',
          fichaPerfilId: 'f-1',
          fechaCreacion: '2026-09-01T10:00:00Z',
          estadoEvaluacionId: null,
          estadoEvaluacionNombre: null,
          representante: { id: 'r-2', nombre: 'Pedro Sol' },
        },
      ],
    });

    // Act
    render(<EvaluacionesMiFichaPanel />);

    // Assert
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText('Descartada')).toBeInTheDocument();
    expect(items[0]).toHaveTextContent('Evaluada por Rosa Gil');
    expect(items[0].querySelector('time')).toHaveAttribute('datetime', '2026-09-05T10:00:00Z');
    expect(within(items[1]).getByText('Sin estado')).toBeInTheDocument();
    expect(items[1]).toHaveTextContent('Evaluada por Pedro Sol');
  });
});
