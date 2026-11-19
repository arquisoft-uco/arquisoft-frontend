import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { useObservacionesEvaluacionAsesor } from '../../hooks/useObservacionesEvaluacionAsesor';
import type { EvaluacionFichaPerfilAsesor } from '../../models/EvaluacionFichaPerfilAsesor';
import ObservacionesEvaluacionAsesorPanel from './ObservacionesEvaluacionAsesorPanel';

vi.mock('../../hooks/useObservacionesEvaluacionAsesor', () => ({
  useObservacionesEvaluacionAsesor: vi.fn(),
}));

const EVALUACION: EvaluacionFichaPerfilAsesor = {
  id: 'ev-1',
  fichaPerfilId: 'f-1',
  tituloProyecto: 'Sistema de monitoreo',
  fechaCreacion: '2026-09-01T10:00:00Z',
  estadoEvaluacionId: 'DESCARTADA',
  estadoEvaluacionNombre: 'Descartada',
  representante: { id: 'r-1', nombre: 'Rosa Gil' },
};

function conObservaciones(parcial: Partial<ReturnType<typeof useObservacionesEvaluacionAsesor>>) {
  vi.mocked(useObservacionesEvaluacionAsesor).mockReturnValue({
    observaciones: [],
    isLoading: false,
    cargado: true,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useObservacionesEvaluacionAsesor>);
}

describe('ObservacionesEvaluacionAsesorPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista las observaciones con el representante y el estado, sin editar ni eliminar', () => {
    // Arrange
    conObservaciones({
      observaciones: [
        { id: 'o-1', evaluacionFichaPerfilId: 'ev-1', observacion: 'Ajustar el alcance' },
        { id: 'o-2', evaluacionFichaPerfilId: 'ev-1', observacion: 'Precisar la metodología' },
      ],
    });

    // Act
    render(<ObservacionesEvaluacionAsesorPanel evaluacion={EVALUACION} onCerrar={vi.fn()} />);

    // Assert
    expect(useObservacionesEvaluacionAsesor).toHaveBeenCalledWith('f-1', 'ev-1');
    expect(screen.getByText('Ajustar el alcance')).toBeInTheDocument();
    expect(screen.getByText('Precisar la metodología')).toBeInTheDocument();
    expect(screen.getByText('Evaluada por Rosa Gil')).toBeInTheDocument();
    expect(screen.getByText('Descartada')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Editar observación' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Eliminar observación' })).not.toBeInTheDocument();
  });

  it('muestra el estado de carga', () => {
    // Arrange
    conObservaciones({ isLoading: true, cargado: false });

    // Act
    render(<ObservacionesEvaluacionAsesorPanel evaluacion={EVALUACION} onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando observaciones…');
  });

  it('sin observaciones muestra el vacío del plan', () => {
    // Arrange
    conObservaciones({ observaciones: [] });

    // Act
    render(<ObservacionesEvaluacionAsesorPanel evaluacion={EVALUACION} onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByText('Esta evaluación aún no tiene observaciones')).toBeInTheDocument();
    expect(screen.getByText('Cuando el comité las registre, las verás aquí.')).toBeInTheDocument();
  });

  it('ante un error muestra la alerta y «Reintentar» vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    conObservaciones({ isError: true, cargado: false, error: new Error('fallo'), refetch });
    render(<ObservacionesEvaluacionAsesorPanel evaluacion={EVALUACION} onCerrar={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar las observaciones');
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('«Cerrar» invoca onCerrar', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    conObservaciones({});
    render(<ObservacionesEvaluacionAsesorPanel evaluacion={EVALUACION} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
