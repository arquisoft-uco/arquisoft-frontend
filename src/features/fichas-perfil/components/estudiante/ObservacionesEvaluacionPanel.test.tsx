import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { useObservacionesEvaluacionMiFicha } from '../../hooks/useObservacionesEvaluacionMiFicha';
import type { EvaluacionFichaPerfilEstudiante } from '../../models/EvaluacionFichaPerfilEstudiante';
import ObservacionesEvaluacionPanel from './ObservacionesEvaluacionPanel';

vi.mock('../../hooks/useObservacionesEvaluacionMiFicha', () => ({
  useObservacionesEvaluacionMiFicha: vi.fn(),
}));

const EVALUACION: EvaluacionFichaPerfilEstudiante = {
  id: 'ev-1',
  fichaPerfilId: 'f-1',
  fechaCreacion: '2026-09-01T10:00:00Z',
  estadoEvaluacionId: 'DESCARTADA',
  estadoEvaluacionNombre: 'Descartada',
  representante: { id: 'r-1', nombre: 'Rosa Gil' },
};

function conObservaciones(parcial: Partial<ReturnType<typeof useObservacionesEvaluacionMiFicha>>) {
  vi.mocked(useObservacionesEvaluacionMiFicha).mockReturnValue({
    observaciones: [],
    isLoading: false,
    cargado: true,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useObservacionesEvaluacionMiFicha>);
}

describe('ObservacionesEvaluacionPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el estado de carga y no pinta el vacío', () => {
    // Arrange
    conObservaciones({ isLoading: true, cargado: false });

    // Act
    render(<ObservacionesEvaluacionPanel evaluacion={EVALUACION} onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando observaciones…');
    expect(
      screen.queryByText('Esta evaluación aún no tiene observaciones'),
    ).not.toBeInTheDocument();
  });

  it('ante un error muestra la alerta y «Reintentar» vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    conObservaciones({ isError: true, cargado: false, error: new Error('fallo'), refetch });
    render(<ObservacionesEvaluacionPanel evaluacion={EVALUACION} onCerrar={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar las observaciones');
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('sin observaciones muestra el mensaje de vacío', () => {
    // Arrange
    conObservaciones({ observaciones: [] });

    // Act
    render(<ObservacionesEvaluacionPanel evaluacion={EVALUACION} onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByText('Esta evaluación aún no tiene observaciones')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('lista cada observación con el representante y el estado de la evaluación', () => {
    // Arrange
    conObservaciones({
      observaciones: [
        { id: 'o-1', evaluacionFichaPerfilId: 'ev-1', observacion: 'Ajustar el alcance' },
        { id: 'o-2', evaluacionFichaPerfilId: 'ev-1', observacion: 'Precisar la metodología' },
      ],
    });

    // Act
    render(<ObservacionesEvaluacionPanel evaluacion={EVALUACION} onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByText('Ajustar el alcance')).toBeInTheDocument();
    expect(screen.getByText('Precisar la metodología')).toBeInTheDocument();
    expect(screen.getByText('Evaluada por Rosa Gil')).toBeInTheDocument();
    expect(screen.getByText('Descartada')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Editar observación' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Eliminar observación' })).not.toBeInTheDocument();
  });

  it('«Cerrar» invoca onCerrar', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    conObservaciones({});
    render(<ObservacionesEvaluacionPanel evaluacion={EVALUACION} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
